package com.rakuten.tech.service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.text.ParseException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.persistence.Tuple;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Path;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rakuten.tech.constants.CommonConstants;
import com.rakuten.tech.convert.EntityConverter;
import com.rakuten.tech.entity.KhAuthor;
import com.rakuten.tech.entity.KhComment;
import com.rakuten.tech.entity.KhNotebook;
import com.rakuten.tech.entity.KhNotebookAuthor;
import com.rakuten.tech.entity.KhNotebookTag;
import com.rakuten.tech.entity.KhPageView;
import com.rakuten.tech.entity.KhTag;
import com.rakuten.tech.entity.KhNotebook.Comment;
import com.rakuten.tech.entity.KhNotebook.KhNotebookId;
import com.rakuten.tech.entity.KhNotebookAuthor.KhNootbookAuthorId;
import com.rakuten.tech.entity.KhNotebookTag.KhNotebookTagId;
import com.rakuten.tech.exception.KhException;
import com.rakuten.tech.exception.PrivilegeException;
import com.rakuten.tech.model.NotebookListCondition;
import com.rakuten.tech.model.PublishParameter;
import com.rakuten.tech.nbconvert.ExecuteResult;
import com.rakuten.tech.nbconvert.LocalCommandExecutorImpl;
import com.rakuten.tech.repository.KhAuthorRepository;
import com.rakuten.tech.repository.KhCommentRepository;
import com.rakuten.tech.repository.KhNotebookAuthorRepository;
import com.rakuten.tech.repository.KhNotebookRepository;
import com.rakuten.tech.repository.KhNotebookTagRepository;
import com.rakuten.tech.repository.KhPageViewsRepository;
import com.rakuten.tech.repository.KhTagRepository;
import com.rakuten.tech.util.DateUtil;

import io.swagger.models.HttpMethod;
import lombok.extern.slf4j.Slf4j;

@Service
@CacheConfig(cacheNames = { "notebook" })
@Slf4j(topic = "NotebookService")
public class NotebookService {

	@Autowired
	private KhNotebookRepository khNotebookRepository;
	@Autowired
	private KhNotebookAuthorRepository khNotebookAuthorRepository;
	@Autowired
	private KhAuthorRepository khAuthorRepository;
	@Autowired
	private KhPageViewsRepository khPageViewsRepository;
	@Autowired
	private KhNotebookTagRepository khTagRepository;
	@Autowired
	private KhCommentRepository khCommentRepository;
	@Autowired
	private KhTagRepository tagRepository;

	private final Integer CMD_TIMEOUT_SEC = 1000 * 60; // 60 seconds

	@Value("${kh.file_path}")
	private String filePath;

	public Page<KhNotebook> getNotebookList(NotebookListCondition conditions) {

		int pageNo = conditions.getPageNo() > 0 ? conditions.getPageNo() - 1 : 0;
		Pageable pageable = PageRequest.of(pageNo, conditions.getLimit(), Direction.DESC,
				CommonConstants.COLUMN_UPDATE_TIME);

		String[] notebookIds = null;
		if (needToFindNookbookIds(conditions)) {
			notebookIds = findNotebookIds(conditions);
			if (ArrayUtils.isEmpty(notebookIds)) {
				return null;
			}
		} else if (ArrayUtils.isNotEmpty(conditions.getNotebookIds())) {
			notebookIds = conditions.getNotebookIds();
		}

		final String[] innerNotebookIds = notebookIds;

		Specification<KhNotebook> spec = new Specification<KhNotebook>() {
			private static final long serialVersionUID = -1342836052280091464L;

			@Override
			public Predicate toPredicate(Root<KhNotebook> root, CriteriaQuery<?> query,
					CriteriaBuilder criteriaBuilder) {

				Path<String> notebookId = root.get("id").get(CommonConstants.COLUMN_NOTEBOOK_ID);
				Path<String> title = root.get(CommonConstants.COLUMN_TITLE_NAME);
				Path<String> subtitle = root.get(CommonConstants.COLUMN_SUBTITLE_NAME);
				Path<String> status = root.get("id").get(CommonConstants.COLUMN_RECORD_STATUS);
				Path<String> keyword = root.get(CommonConstants.COLUMN_KEYWORDS);
				Path<LocalDateTime> updateTime = root.get(CommonConstants.COLUMN_UPDATE_TIME);

				List<Predicate> predicatesList = new ArrayList<Predicate>();

				Predicate statusPred = criteriaBuilder.equal(status, conditions.getRecordStatus());
				predicatesList.add(statusPred);

				if (ArrayUtils.isNotEmpty(innerNotebookIds)) {
					Predicate predicate = addEqualCondition(criteriaBuilder, notebookId, innerNotebookIds);
					predicatesList.add(predicate);
				}

				predicatesList = addPredicate(predicatesList,
						addLikeCondition(criteriaBuilder, title, transToArray(conditions.getTitle())));
				predicatesList = addPredicate(predicatesList,
						addLikeCondition(criteriaBuilder, subtitle, transToArray(conditions.getSubTitle())));
				predicatesList = addPredicate(predicatesList,
						addLikeCondition(criteriaBuilder, keyword, transToArray(conditions.getKeyword())));
				predicatesList = addPredicate(predicatesList,
						addTimeCondition(criteriaBuilder, updateTime, conditions));

				Predicate[] predicates = new Predicate[predicatesList.size()];
				return criteriaBuilder.and(predicatesList.toArray(predicates));
			}
		};

		Page<KhNotebook> notebookList = khNotebookRepository.findAll(spec, pageable);

		if (!CollectionUtils.isEmpty(notebookList.getContent())) {
			notebookList = queryOtherData(notebookList, conditions.getRecordStatus());
		}
		return notebookList;
	}

	/**
	 * Search behavior is same as like
	 */
	public Page<KhNotebook> searchNotebook(NotebookListCondition conditions, CommonConstants.SEARCH_CATEGORY type) {

		int pageNo = conditions.getPageNo() > 0 ? conditions.getPageNo() - 1 : 0;
		Pageable pageable = PageRequest.of(pageNo, conditions.getLimit(), Direction.DESC,
				CommonConstants.COLUMN_UPDATE_TIME);

		Set<String> notebookSet = new HashSet<String>();

		List<String> transNbIds = null;

		switch (type) {
		case AUTHOR:
			transNbIds = khNotebookAuthorRepository.findNotebookIdsByExcatAuthor(conditions.getAuthor(),
					conditions.getRecordStatus());
			break;
		case TAG:
			transNbIds = khTagRepository.findNotebookIdsByExcatTagName(conditions.getTag(),
					conditions.getRecordStatus());
			break;
		}

		if (!CollectionUtils.isEmpty(transNbIds)) {
			notebookSet.addAll(transNbIds);
		} else {
			return null;
		}

		final String[] innerNotebookIds = notebookSet.toArray(new String[notebookSet.size()]);

		Specification<KhNotebook> spec = new Specification<KhNotebook>() {
			private static final long serialVersionUID = -1342836052280091464L;

			@Override
			public Predicate toPredicate(Root<KhNotebook> root, CriteriaQuery<?> query,
					CriteriaBuilder criteriaBuilder) {

				Path<String> notebookId = root.get("id").get(CommonConstants.COLUMN_NOTEBOOK_ID);
				Path<String> status = root.get("id").get(CommonConstants.COLUMN_RECORD_STATUS);

				List<Predicate> predicatesList = new ArrayList<Predicate>();
				Predicate predicate = addEqualCondition(criteriaBuilder, notebookId, innerNotebookIds);
				predicatesList.add(predicate);
				Predicate statusPred = criteriaBuilder.equal(status, conditions.getRecordStatus());
				Predicate[] predicates = new Predicate[predicatesList.size()];
				Predicate orConds = criteriaBuilder.and(predicatesList.toArray(predicates));
				return criteriaBuilder.and(orConds, statusPred);
			}
		};

		Page<KhNotebook> notebookList = khNotebookRepository.findAll(spec, pageable);

		if (!CollectionUtils.isEmpty(notebookList.getContent())) {
			notebookList = queryOtherData(notebookList, conditions.getRecordStatus());
		}
		return notebookList;
	}

	public Page<KhNotebook> searchNotebookList(NotebookListCondition conditions) {

		int pageNo = conditions.getPageNo() > 0 ? conditions.getPageNo() - 1 : 0;
		Pageable pageable = PageRequest.of(pageNo, conditions.getLimit(), Direction.DESC,
				CommonConstants.COLUMN_UPDATE_TIME);

		Set<String> notebookSet = new HashSet<String>();

		String[] authorNbIds = null;
		String[] tagNbIds = null;

		if (StringUtils.isNoneBlank(conditions.getKeyword())) {
			authorNbIds = khNotebookAuthorRepository.findNotebookIdsByAuthor(conditions.getKeyword(),
					conditions.getRecordStatus());
			tagNbIds = khTagRepository.findNotebookIdsByTagName(conditions.getKeyword(), conditions.getRecordStatus());
		}

		if (ArrayUtils.isNotEmpty(authorNbIds)) {
			notebookSet.addAll(Arrays.asList(authorNbIds));
		}
		if (ArrayUtils.isNotEmpty(tagNbIds)) {
			notebookSet.addAll(Arrays.asList(tagNbIds));
		}

		final String[] innerNotebookIds = notebookSet.toArray(new String[notebookSet.size()]);

		Specification<KhNotebook> spec = new Specification<KhNotebook>() {
			private static final long serialVersionUID = -1342836052280091464L;

			@Override
			public Predicate toPredicate(Root<KhNotebook> root, CriteriaQuery<?> query,
					CriteriaBuilder criteriaBuilder) {

				Path<String> notebookId = root.get("id").get(CommonConstants.COLUMN_NOTEBOOK_ID);
				Path<String> title = root.get(CommonConstants.COLUMN_TITLE_NAME);
				Path<String> subtitle = root.get(CommonConstants.COLUMN_SUBTITLE_NAME);
				Path<String> status = root.get("id").get(CommonConstants.COLUMN_RECORD_STATUS);
				Path<String> keyword = root.get(CommonConstants.COLUMN_KEYWORDS);
				Path<LocalDateTime> updateTime = root.get(CommonConstants.COLUMN_UPDATE_TIME);

				List<Predicate> predicatesList = new ArrayList<Predicate>();

				if (ArrayUtils.isNotEmpty(innerNotebookIds)) {
					Predicate predicate = addEqualCondition(criteriaBuilder, notebookId, innerNotebookIds);
					predicatesList.add(predicate);
				}

				predicatesList = addPredicate(predicatesList,
						addLikeCondition(criteriaBuilder, title, transToArray(conditions.getKeyword())));
				predicatesList = addPredicate(predicatesList,
						addLikeCondition(criteriaBuilder, subtitle, transToArray(conditions.getKeyword())));
				predicatesList = addPredicate(predicatesList,
						addLikeCondition(criteriaBuilder, keyword, transToArray(conditions.getKeyword())));

				Predicate statusPred = criteriaBuilder.equal(status, conditions.getRecordStatus());
				Predicate updateTimePred = addTimeCondition(criteriaBuilder, updateTime, conditions);

				Predicate[] predicates = new Predicate[predicatesList.size()];
				Predicate orConds = criteriaBuilder.or(predicatesList.toArray(predicates));

				if (updateTimePred == null) {
					return criteriaBuilder.and(orConds, statusPred);
				} else {
					return criteriaBuilder.and(orConds, updateTimePred, statusPred);
				}
			}
		};

		Page<KhNotebook> notebookList = khNotebookRepository.findAll(spec, pageable);

		if (!CollectionUtils.isEmpty(notebookList.getContent())) {
			notebookList = queryOtherData(notebookList, conditions.getRecordStatus());
		}
		return notebookList;
	}

	private Page<KhNotebook> queryOtherData(Page<KhNotebook> notebookList, String status) {
		List<String> notebookIdList = getIds(notebookList);
		List<Tuple> authors = khNotebookAuthorRepository.findAuthorsByNotebookIds(notebookIdList, status);
		List<Tuple> viewCounts = khPageViewsRepository.findPageViewCountByNotbookIds(notebookIdList);
		List<Tuple> tags = khTagRepository.findTagsByNotebookIds(notebookIdList, status);
		List<Tuple> commentCnts = khCommentRepository.findCommentCountByNotebookId(notebookIdList);

		notebookList = joinMeta(notebookList, transToMap(authors), transToMap(viewCounts), transToMap(commentCnts),
				transToMap(tags));
		return notebookList;
	}

	private List<Predicate> addPredicate(List<Predicate> predicateList, Predicate predicate) {
		if (predicate != null) {
			predicateList.add(predicate);
		}
		return predicateList;
	}

	private boolean needToFindNookbookIds(NotebookListCondition condition) {
		return StringUtils.isNotBlank(condition.getAuthor()) || StringUtils.isNotBlank(condition.getTag());
	}

	private String[] transToArray(String str) {
		String[] ary = null;
		if (StringUtils.isNotBlank(str)) {
			ary = new String[1];
			ary[0] = str;
		}
		return ary;
	}

	private Predicate addEqualCondition(CriteriaBuilder criteriaBuilder, Path<String> columnName,
			String[] conditionVals) {

		Predicate predicate = null;
		if (ArrayUtils.isNotEmpty(conditionVals)) {
			List<Predicate> innerPredicateList = new ArrayList<Predicate>();
			for (int index = 0; index < conditionVals.length; index++) {
				Predicate cond = criteriaBuilder.equal(columnName, conditionVals[index]);
				innerPredicateList.add(cond);
			}
			predicate = transToPredicateAry(criteriaBuilder, innerPredicateList);
		}
		return predicate;
	}

	private Predicate addLikeCondition(CriteriaBuilder criteriaBuilder, Path<String> columnName,
			String[] conditionVals) {

		Predicate predicate = null;
		if (ArrayUtils.isNotEmpty(conditionVals)) {
			List<Predicate> innerPredicateList = new ArrayList<Predicate>();
			for (int index = 0; index < conditionVals.length; index++) {
				Predicate cond = criteriaBuilder.like(columnName, "%" + conditionVals[index] + "%");
				innerPredicateList.add(cond);
			}
			predicate = transToPredicateAry(criteriaBuilder, innerPredicateList);
		}
		return predicate;
	}

	private String[] findNotebookIds(NotebookListCondition conditions) {

		Set<String> duplicate = new HashSet<String>();
		if (StringUtils.isNotBlank(conditions.getAuthor())) {
			String[] notebookIds = khNotebookAuthorRepository.findNotebookIdsByAuthor(conditions.getAuthor(),
					conditions.getRecordStatus());
			if (ArrayUtils.isNotEmpty(notebookIds)) {
				duplicate = new HashSet<String>(Arrays.asList(notebookIds));
			}
		}

		if (StringUtils.isNotBlank(conditions.getTag())) {
			String[] notebookIds = khTagRepository.findNotebookIdsByTagName(conditions.getTag(),
					conditions.getRecordStatus());
			if (CollectionUtils.isEmpty(duplicate)) {
				duplicate = new HashSet<String>(Arrays.asList(notebookIds));
			} else {
				Set<String> s = new HashSet<String>();
				for (String id : notebookIds) {
					if (duplicate.contains(id)) {
						s.add(id);
					}
				}
				duplicate = s;
			}
		}
		return duplicate.toArray(new String[duplicate.size()]);
	}

	private Predicate transToPredicateAry(CriteriaBuilder criteriaBuilder, List<Predicate> innerPredicateList) {
		Predicate[] predicates = new Predicate[innerPredicateList.size()];
		Predicate predicate = criteriaBuilder.or(innerPredicateList.toArray(predicates));
		return predicate;
	}

	private Predicate addTimeCondition(CriteriaBuilder criteriaBuilder, Path<LocalDateTime> updateTime,
			NotebookListCondition conditions) {

		Predicate dateTimePred;
		Predicate predicate = null;
		if (StringUtils.isNoneBlank(conditions.getStartTime(), conditions.getEndTime())) {
			dateTimePred = criteriaBuilder.between(updateTime, DateUtil.stringToLocalDate(conditions.getStartTime()),
					DateUtil.stringToLocalDate(conditions.getEndTime()));
			predicate = criteriaBuilder.and(dateTimePred);

		} else if (StringUtils.isBlank(conditions.getEndTime()) && StringUtils.isNotBlank(conditions.getStartTime())) {
			dateTimePred = criteriaBuilder.greaterThanOrEqualTo(updateTime,
					DateUtil.stringToLocalDate(conditions.getStartTime()));
			predicate = criteriaBuilder.and(dateTimePred);

		} else if (StringUtils.isBlank(conditions.getStartTime()) && StringUtils.isNotBlank(conditions.getEndTime())) {
			dateTimePred = criteriaBuilder.lessThanOrEqualTo(updateTime,
					DateUtil.stringToLocalDate(conditions.getEndTime()));
			predicate = criteriaBuilder.and(dateTimePred);

		}
		return predicate;
	}

	private Map<String, Object> transToMap(List<Tuple> inputList) {
		Map<String, Object> result = new HashMap<String, Object>();
		inputList.forEach(p -> {
			result.put((String) p.get(0), p.get(1));
		});
		return result;
	}

	private Page<KhNotebook> joinMeta(Page<KhNotebook> notebookList, Map<String, Object> authors,
			Map<String, Object> viewCounts, Map<String, Object> commentCounts, Map<String, Object> tags) {
		notebookList.forEach(c -> {

			String notebookId = c.getId().getNotebookId();
			if (authors.containsKey(notebookId)) {
				c.setAuthors(((String) authors.get(notebookId)).split(","));
			}
			if (viewCounts.containsKey(notebookId)) {
				c.setPageView(((BigInteger) viewCounts.get(notebookId)).intValue());
			}
			if (commentCounts.containsKey(notebookId)) {
				c.setCommentCount(((BigInteger) commentCounts.get(notebookId)).intValue());
			}
			if (tags.containsKey(notebookId)) {
				c.setTags(((String) tags.get(notebookId)).split(","));
			}
		});

		return notebookList;
	}

	private List<String> getIds(Page<KhNotebook> notebookList) {
		Set<String> ids = new HashSet<String>();
		for (KhNotebook notebook : notebookList.getContent()) {
			ids.add(notebook.getId().getNotebookId());
		}
		return new ArrayList<String>(ids);
	}

	private KhNotebook joinDetails(KhNotebook notebook, Map<String, Object> authorIds, Map<String, Object> authorNames,
			Map<String, Object> tags, Map<String, Object> viewCounts, List<Comment> comments) {

		String notebookId = notebook.getId().getNotebookId();
		if (authorNames.containsKey(notebookId)) {
			notebook.setAuthors(((String) authorNames.get(notebookId)).split(","));
			notebook.setAuthorIds(((String) authorIds.get(notebookId)).split(","));
		}
		if (tags.containsKey(notebookId)) {
			notebook.setTags(((String) tags.get(notebookId)).split(","));
		}
		if (viewCounts != null && viewCounts.containsKey(notebookId)) {
			notebook.setPageView(((BigInteger) viewCounts.get(notebookId)).intValue());
		}
		if (comments != null) {
			notebook.setComments(comments);
			notebook.setCommentCount(comments.size());
		}
		return notebook;
	}

	private List<Comment> transToComment(List<Tuple> commentList) {
		List<Comment> khComments = new ArrayList<Comment>(commentList.size());
		commentList.forEach(p -> {
			Comment comment = new Comment();
			comment.setCommentId((Integer) p.get(0));
			comment.setUserId((String) p.get(1));
			comment.setUserName((String) p.get(2));
			comment.setComment((String) p.get(3));
			Timestamp createTime = (Timestamp) p.get(4);
			Timestamp updateTime = (Timestamp) p.get(5);
			comment.setCreateTime(LocalDateTime.ofInstant(createTime.toInstant(), ZoneOffset.ofHours(0)));
			comment.setUpdateTime(LocalDateTime.ofInstant(updateTime.toInstant(), ZoneOffset.ofHours(0)));
			khComments.add(comment);
		});
		return khComments;
	}

	public KhNotebook getNotebookDetail(String notebookId) {
		KhNotebookId khId = new KhNotebookId();
		khId.setNotebookId(notebookId);
		khId.setRecordStatus(CommonConstants.RECORD_STATUS_PUBLISH);

		KhNotebook notebook = khNotebookRepository.findById(khId).orElse(null);
		if (notebook == null) {
			return null;
		}
		List<String> id = Arrays.asList(notebookId);
		List<Tuple> authorNames = khNotebookAuthorRepository.findAuthorsByNotebookIds(id,
				CommonConstants.RECORD_STATUS_PUBLISH);
		List<Tuple> authorIds = khNotebookAuthorRepository.findAuthorIdsByNotebookIds(id,
				CommonConstants.RECORD_STATUS_PUBLISH);
		List<Tuple> tags = khTagRepository.findTagsByNotebookIds(id, CommonConstants.RECORD_STATUS_PUBLISH);
		List<Tuple> comments = khCommentRepository.findCommentsByNotebookId(notebookId);
		List<Tuple> viewCounts = khPageViewsRepository.findPageViewCountByNotbookIds(id);

		notebook.setNotebookFilePath(notebook.getPath().replace("." + CommonConstants.FILE_EXTENSION_MARKDOWN,
				"." + CommonConstants.FILE_EXTENSION_NOTEBOOK));
		notebook.setExistOne(true);
		return joinDetails(notebook, transToMap(authorIds), transToMap(authorNames), transToMap(tags),
				transToMap(viewCounts), transToComment(comments));
	}

	public KhNotebook getNotebookPreviewDetail(String notebookId) {

		KhNotebookId khId = new KhNotebookId();
		khId.setNotebookId(notebookId);
		khId.setRecordStatus(CommonConstants.RECORD_STATUS_PREVIEW);

		KhNotebook previewNb = khNotebookRepository.findById(khId).orElse(null);
		if (previewNb == null) {
			return null;
		}
		KhNotebook publishNb = getPublishOne(notebookId);
		if (publishNb != null) {
			previewNb.setExistOne(true);
			previewNb.setTitle(publishNb.getTitle());
			previewNb.setSubTitle(publishNb.getSubTitle());
			previewNb.setKeywords(publishNb.getKeywords());
			previewNb.setCreateTime(publishNb.getCreateTime());
		} else {
			previewNb.setExistOne(false);
		}
		List<String> id = Arrays.asList(notebookId);
		List<Tuple> authorIds = khNotebookAuthorRepository.findAuthorIdsByNotebookIds(id,
				CommonConstants.RECORD_STATUS_PUBLISH);
		List<Tuple> authorNames = khNotebookAuthorRepository.findAuthorsByNotebookIds(id,
				CommonConstants.RECORD_STATUS_PUBLISH);
		List<Tuple> tags = khTagRepository.findTagsByNotebookIds(id, CommonConstants.RECORD_STATUS_PUBLISH);

		return joinDetails(previewNb, transToMap(authorIds), transToMap(authorNames), transToMap(tags), null, null);
	}

	private KhNotebook getPublishOne(String notebookId) {
		KhNotebookId khId = new KhNotebookId();
		khId.setNotebookId(notebookId);
		khId.setRecordStatus(CommonConstants.RECORD_STATUS_PUBLISH);

		return khNotebookRepository.findById(khId).orElse(null);
	}

	public ExecuteResult saveFile(PublishParameter publishParameter, MultipartFile projectFile)
			throws IllegalStateException, IOException {

		LocalDate today = LocalDate.now();

		String yearFolderName = String.valueOf(today.getYear());

		String folderName = String.join(File.separator, yearFolderName, publishParameter.getNotebookId(),
				String.valueOf(new Date().getTime()));

		FileUtils.deleteDirectory(new File(folderName));

		String targetFileName = String.join(File.separator, filePath, folderName, projectFile.getOriginalFilename());
		File targetFile = new File(targetFileName);
		targetFile.getParentFile().mkdirs();
		projectFile.transferTo(targetFile);

		String[] cmdArr = new String[] { "jupyter", "nbconvert", "--to=markdown", targetFileName };

		LocalCommandExecutorImpl exec = new LocalCommandExecutorImpl();
		log.info("CMD: {}", Arrays.toString(cmdArr));

		ExecuteResult result = exec.executeCommand(cmdArr, Integer.valueOf(CMD_TIMEOUT_SEC));
		if (result.getExitCode() == 0) {
			String mdFileName = targetFileName.replace("." + CommonConstants.FILE_EXTENSION_NOTEBOOK,
					"." + CommonConstants.FILE_EXTENSION_MARKDOWN);
			result.setExecuteOut(mdFileName);

			removeNbIdFromFile(targetFile);
		}
		log.info("CMD Result: {} - {}", result.getExitCode(), result.getExecuteOut());
		return result;
	}

	@SuppressWarnings("unchecked")
	private void removeNbIdFromFile(File inputFile) throws JsonParseException, JsonMappingException, IOException {
		ObjectMapper objectMapper = new ObjectMapper();
		Map<String, ?> json = objectMapper.readValue(inputFile, Map.class);
		((Map<String, ?>) json.get("metadata")).remove("nb_id");
		FileWriter fileWriter = new FileWriter(inputFile, false);
		objectMapper.writer().writeValue(fileWriter, json);
	}

	@Transactional
	public void saveKhNotebook(PublishParameter inputParameter, String folderPath) throws ParseException {
		KhNotebookId id = new KhNotebookId();
		id.setNotebookId(inputParameter.getNotebookId());
		id.setRecordStatus(inputParameter.getRecordStatus());
		KhNotebook khNotebook = EntityConverter.convertToNotebook(inputParameter, folderPath);
		khNotebookRepository.saveAndFlush(khNotebook);

		saveAuthors(inputParameter, inputParameter.getRecordStatus());
		saveTags(inputParameter, inputParameter.getRecordStatus());
	}

	public void saveAuthorInfo(String authorId, String authorName) throws KhException {
		KhAuthor author = khAuthorRepository.findById(authorId).orElse(null);
		if (author == null) {
			author = new KhAuthor();
			author.setAuthorId(authorId);
			author.setAuthorName(authorName);
			author.setActive(CommonConstants.USER_STATUS_IS_ACTIVE);
			author.setPostNotif(CommonConstants.POST_NOTIF_IS_ACTIVE);
			author.setCommentNotif(CommonConstants.COMMENT_NOTIF_IS_ACTIVE);
			author.setCreateTime(LocalDateTime.now());
			author.setUpdateTime(LocalDateTime.now());
			khAuthorRepository.save(author);
		}
	}

	private void saveAuthors(PublishParameter inputParameter, String recordStatus) {

		if (ArrayUtils.isNotEmpty(inputParameter.getAuthorIds())) {

			List<KhNotebookAuthor> authorList = new ArrayList<KhNotebookAuthor>();
			String[] authorIds = inputParameter.getAuthorIds();
			for (int index = 0; index < authorIds.length; index++) {
				KhNotebookAuthor author = new KhNotebookAuthor();
				KhNootbookAuthorId id = new KhNootbookAuthorId();
				id.setNotebookId(inputParameter.getNotebookId());
				id.setRecordStatus(recordStatus);
				id.setAuthorId(authorIds[index]);
				author.setId(id);
				author.setAuthorOrder(index);
				authorList.add(author);
			}
			khNotebookAuthorRepository.deleteByNotebookIds(Arrays.asList(inputParameter.getNotebookId()), recordStatus);
			khNotebookAuthorRepository.saveAll(authorList);
		}
	}

	private void saveTags(PublishParameter inputParameter, String recordStatus) {

		khTagRepository.deleteByNotebookIds(Arrays.asList(inputParameter.getNotebookId()), recordStatus);

		if (ArrayUtils.isNotEmpty(inputParameter.getTags())) {
			List<KhNotebookTag> tagList = new ArrayList<KhNotebookTag>();
			for (String tagId : inputParameter.getTags()) {
				KhNotebookTag khTag = new KhNotebookTag();
				KhNotebookTagId id = new KhNotebookTagId();
				id.setNotebookId(inputParameter.getNotebookId());
				id.setRecordStatus(recordStatus);
				id.setTagId(tagId);
				khTag.setId(id);
				tagList.add(khTag);
			}
			khTagRepository.saveAll(tagList);
			tagRepository.saveAll(getKhTag(inputParameter.getTags()));
		}
	}

	private List<KhTag> getKhTag(String[] tagList) {
		List<KhTag> khTags = new ArrayList<KhTag>();
		for (String tag : tagList) {
			KhTag khTag = new KhTag();
			khTag.setTagId(tag);
			khTag.setCreateTime(LocalDateTime.now());
			khTags.add(khTag);
		}
		return khTags;
	}

	@Caching(evict = { @CacheEvict(value = "populateTag", allEntries = true),
			@CacheEvict(value = "populateNb", allEntries = true) })
	public void updateViewCount(String notebookId, String userId, String ipAddress) {
		KhPageView pageView = new KhPageView();
		pageView.setNotebookId(notebookId);
		pageView.setUserId(userId);
		pageView.setIpAddress(ipAddress);
		pageView.setObjectAction(HttpMethod.GET.name());
		pageView.setCreateTime(LocalDateTime.now());
		khPageViewsRepository.save(pageView);
	}

	@Transactional
	public void insertComment(String notebookId, String userId, String userName, String comment) {
		KhComment khComment = new KhComment();
		khComment.setNotebookId(notebookId);
		khComment.setUserId(userId);
		khComment.setUserName(userName);
		khComment.setComment(comment);
		khComment.setCreateTime(LocalDateTime.now());
		khComment.setUpdateTime(LocalDateTime.now());
		khCommentRepository.saveAndFlush(khComment);
	}

	@Transactional
	public boolean updateComment(String commentId, String userId, String userName, String comment)
			throws PrivilegeException {
		KhComment khComment = khCommentRepository.findById(Integer.valueOf(commentId)).orElse(null);
		checkCommentPrivilege(khComment.getUserId(), userId);
		if (khComment != null) {
			khComment.setComment(comment);
			khComment.setUserName(userName);
			khComment.setUpdateTime(LocalDateTime.now());
			khCommentRepository.saveAndFlush(khComment);
		}
		return khComment != null;
	}

	@Transactional
	public boolean deleteComment(String commentId, String userId) throws PrivilegeException {
		KhComment khComment = khCommentRepository.findById(Integer.valueOf(commentId)).orElse(null);
		checkCommentPrivilege(khComment.getUserId(), userId);
		if (khComment != null) {
			khCommentRepository.delete(khComment);
		}
		return khComment != null;
	}

	private void checkCommentPrivilege(String autorId, String editorId) throws PrivilegeException {
		if (!autorId.equals(editorId)) {
			throw new PrivilegeException(
					"Login user " + editorId + " doesn't have privilege to update it! Only " + autorId + " can.");
		}
	}

	@Transactional
	public boolean updateRecord(PublishParameter inputParameter, String editorId)
			throws KhException, PrivilegeException {
		KhNotebookId id = new KhNotebookId();
		id.setNotebookId(inputParameter.getNotebookId());
		id.setRecordStatus(inputParameter.getRecordStatus());

		KhNotebook khNotebook = khNotebookRepository.findById(id).orElse(null);
		if (khNotebook != null) {
			checkPrivilege(inputParameter.getNotebookId(), editorId);

			if (StringUtils.isNotBlank(inputParameter.getTitle())) {
				khNotebook.setTitle(inputParameter.getTitle());
			}
			if (StringUtils.isNotBlank(inputParameter.getSubTitle())) {
				khNotebook.setSubTitle(inputParameter.getSubTitle());
			}
			if (StringUtils.isNotBlank(inputParameter.getKeywords())) {
				khNotebook.setKeywords(inputParameter.getKeywords());
			}
			khNotebook.setUpdateTime(new Date());
			khNotebookRepository.saveAndFlush(khNotebook);
			saveAuthors(inputParameter, inputParameter.getRecordStatus());
			saveTags(inputParameter, inputParameter.getRecordStatus());
		}
		return khNotebook != null;
	}

	@Transactional
	public boolean deleteRecord(String notebookId, String editorId) throws PrivilegeException {

		KhNotebookId id = new KhNotebookId();
		id.setNotebookId(notebookId);
		id.setRecordStatus(CommonConstants.RECORD_STATUS_PUBLISH);

		KhNotebook currentRecord = khNotebookRepository.findById(id).orElse(null);
		if (currentRecord != null) {
			checkPrivilege(notebookId, editorId);
			khNotebookRepository.deleteByNotebookId(notebookId, CommonConstants.RECORD_STATUS_DELETE);
			khNotebookRepository.updateStatusByNotebookId(notebookId, CommonConstants.RECORD_STATUS_PUBLISH,
					CommonConstants.RECORD_STATUS_DELETE);

			khNotebookAuthorRepository.deleteByNotebookId(notebookId, CommonConstants.RECORD_STATUS_DELETE);
			khNotebookAuthorRepository.updateStatusByNotebookId(notebookId, CommonConstants.RECORD_STATUS_PUBLISH,
					CommonConstants.RECORD_STATUS_DELETE);

			khTagRepository.deleteByNotebookId(notebookId, CommonConstants.RECORD_STATUS_DELETE);
			khTagRepository.updateStatusByNotebookId(notebookId, CommonConstants.RECORD_STATUS_PUBLISH,
					CommonConstants.RECORD_STATUS_DELETE);
		}
		return currentRecord != null;
	}

	private void checkPrivilege(String notebookId, String editorId) throws PrivilegeException {
		String mainAuthorId = khNotebookAuthorRepository.findMainAuthorByNotebookId(notebookId,
				CommonConstants.RECORD_STATUS_PUBLISH);
		if (StringUtils.isNoneBlank(mainAuthorId) && !editorId.equals(mainAuthorId)
				&& !editorId.equals(CommonConstants.ADMIN_ACCOUNT)) {
			throw new PrivilegeException(
					"Login user " + editorId + " doesn't have privilege to update it! Only " + mainAuthorId + " can.");
		}
	}

	@Transactional
	public boolean publishNotebook(PublishParameter inputParameter, String loginUser) throws Exception {
		KhNotebookId id = new KhNotebookId();
		id.setNotebookId(inputParameter.getNotebookId());
		id.setRecordStatus(CommonConstants.RECORD_STATUS_PREVIEW);

		KhNotebook currentRecord = khNotebookRepository.findById(id).orElse(null);

		if (currentRecord != null) {

			checkPrivilege(inputParameter.getNotebookId(), loginUser);

			KhNotebook newRecord = new KhNotebook();
			BeanUtils.copyProperties(currentRecord, newRecord);

			newRecord.getId().setRecordStatus(CommonConstants.RECORD_STATUS_PUBLISH);
			if (StringUtils.isNotBlank(inputParameter.getTitle())) {
				newRecord.setTitle(inputParameter.getTitle());
			}
			if (StringUtils.isNotBlank(inputParameter.getSubTitle())) {
				newRecord.setSubTitle(inputParameter.getSubTitle());
			}

			if (StringUtils.isNotBlank(inputParameter.getKeywords())) {
				newRecord.setKeywords(inputParameter.getKeywords());
			}

			if (StringUtils.isNotBlank(inputParameter.getUpdateTime())) {
				newRecord.setUpdateTime(DateUtil.stringToDate(inputParameter.getUpdateTime()));
			} else {
				newRecord.setUpdateTime(new Date());
			}

			KhNotebookId publishId = new KhNotebookId();
			publishId.setNotebookId(inputParameter.getNotebookId());
			publishId.setRecordStatus(CommonConstants.RECORD_STATUS_PUBLISH);
			KhNotebook publishRecord = khNotebookRepository.findById(publishId).orElse(null);
			if (publishRecord != null) {
				newRecord.setCreateTime(publishRecord.getCreateTime());
			} else {
				newRecord.setCreateTime(new Date());
			}

			khNotebookRepository.saveAndFlush(newRecord);
			saveAuthors(inputParameter, CommonConstants.RECORD_STATUS_PUBLISH);
			saveAuthorInfo(inputParameter.getAuthorIds()[0], inputParameter.getAuthorNames()[0]);
			saveTags(inputParameter, CommonConstants.RECORD_STATUS_PUBLISH);
		} else {
			log.warn("No existed [{}] preview record[{}]", id, CommonConstants.RECORD_STATUS_PREVIEW);
		}
		return currentRecord != null;
	}

	@Cacheable(value = "populateNb", key = "#limit")
	public List<KhNotebook> getPopulatedNotebooks(Integer limit) {
		List<Tuple> viewCountList = khPageViewsRepository.findTopViewCountPages(CommonConstants.RECORD_STATUS_PUBLISH,
				limit);

		if (CollectionUtils.isEmpty(viewCountList)) {
			return null;
		}

		List<KhNotebook> khNotebooks = new ArrayList<KhNotebook>();
		List<String> notebookIds = new ArrayList<String>();

		viewCountList.forEach(p -> {
			KhNotebook notebook = new KhNotebook();
			KhNotebookId id = new KhNotebookId();
			id.setNotebookId((String) p.get(0));
			id.setRecordStatus(CommonConstants.RECORD_STATUS_PUBLISH);

			notebook.setId(id);
			notebook.setPageView(((BigInteger) p.get(1)).intValue());
			notebook.setTitle((String) p.get(2));
			notebook.setCreateTime(new Date(((Timestamp) p.get(3)).getTime()));
			notebook.setUpdateTime(new Date(((Timestamp) p.get(4)).getTime()));
			khNotebooks.add(notebook);
			notebookIds.add((String) p.get(0));
		});

		Map<String, Object> commentCnts = transToMap(khCommentRepository.findCommentCountByNotebookId(notebookIds));

		Map<String, Object> authors = transToMap(khNotebookAuthorRepository.findAuthorsByNotebookIds(notebookIds,
				CommonConstants.RECORD_STATUS_PUBLISH));

		for (KhNotebook notebook : khNotebooks) {
			if (authors.containsKey(notebook.getId().getNotebookId())) {
				notebook.setAuthors(((String) authors.get(notebook.getId().getNotebookId())).split(","));
			}
			if (commentCnts.containsKey(notebook.getId().getNotebookId())) {
				notebook.setCommentCount(((BigInteger) commentCnts.get(notebook.getId().getNotebookId())).intValue());
			} else {
				notebook.setCommentCount(0);
			}
		}
		return khNotebooks;
	}

	@Cacheable(value = "populateTag", key = "#limit")
	public List<String> getPopulatedTags(Integer limit) {
		List<String> tags = new ArrayList<String>();
		khTagRepository.findTopTags(limit, CommonConstants.RECORD_STATUS_PUBLISH).forEach(p -> {
			tags.add((String) p.get(0));
		});
		return tags;
	}

	public Map<String, Integer> getHotTags(Integer limit) {
		Map<String, Integer> tags = new HashMap<String, Integer>();
		khTagRepository.findTopTags(limit, CommonConstants.RECORD_STATUS_PUBLISH).forEach(p -> {
			tags.put((String) p.get(0), ((BigInteger) p.get(1)).intValue());
		});
		return tags;
	}

	public String[] getAllTags() {
		return tagRepository.findAllTags();
	}

	public Map<String, Object> getAllAuthors() {
		return transToMap(khNotebookAuthorRepository.findAllAuthors(CommonConstants.USER_STATUS_IS_ACTIVE));
	}

	public void updteNotificationSetting(String authorId, boolean postNotif, boolean commentNotif) {
		KhAuthor author = khAuthorRepository.findById(authorId).orElse(null);
		if (author != null) {
			author.setPostNotif(postNotif);
			author.setCommentNotif(commentNotif);
			author.setUpdateTime(LocalDateTime.now());
			khAuthorRepository.save(author);
		}

	}

	public KhAuthor getAuthorInfo(String authorId, String authorName) {
		KhAuthor author = null;
		if (StringUtils.isNoneBlank(authorId)) {
			author = khAuthorRepository.findById(authorId).orElse(null);
		} else {
			author = khAuthorRepository.findAuthorByName(authorName);
		}
		return author;
	}
}
