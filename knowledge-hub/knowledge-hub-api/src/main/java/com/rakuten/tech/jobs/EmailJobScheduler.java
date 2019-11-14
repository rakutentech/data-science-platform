package com.rakuten.tech.jobs;

import java.io.IOException;
import java.math.BigInteger;
import java.net.InetAddress;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.persistence.Tuple;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import com.rakuten.tech.constants.CommonConstants;
import com.rakuten.tech.entity.KhJob;
import com.rakuten.tech.repository.KhAuthorRepository;
import com.rakuten.tech.repository.KhCommentRepository;
import com.rakuten.tech.repository.KhJobsRepository;
import com.rakuten.tech.repository.KhLockRepository;
import com.rakuten.tech.repository.KhNotebookRepository;
import com.rakuten.tech.util.DateUtil;

/**
 * Email job scheduler to send the notification mail
 * 
 * @author chienchang.a.huang
 */
@Component
public class EmailJobScheduler {
	private static final Logger logger = LoggerFactory.getLogger(EmailJobScheduler.class);

	@Autowired
	private KhLockRepository lockRepository;
	@Autowired
	private KhJobsRepository jobRepository;
	@Autowired
	private KhAuthorRepository khAuthorRepository;
	@Autowired
	private KhNotebookRepository notebookRepository;
	@Autowired
	private KhCommentRepository commentRepository;

	@Autowired
	private JavaMailSender sender;

	@Value("${kh.mail_sender_name}")
	private String mailSenderName;

	@Value("${kh.mail_sender}")
	private String mailSender;

	@Value("${kh.url}")
	private String khUrl;

	@Value("${kh.notebook_url}")
	private String notebookUrl;

	@Value("${kh.notice_setting_url}")
	private String notificationUrl;

	private final int JOB_BUFFER_MINS = 2;
	private static String IMG_KH_LOGO = "";

	private final String NEW_POST_MAIL_TITLE = "New Post on Knowledge Hub";

	private final String NEW_POSTS_MAIL_TITLE = "New Posts on Knowledge Hub";

	private final String NEW_COMMENT_MAIL_TITLE = "New Comment on Knowledge Hub";

	private final String NEW_COMMENTS_MAIL_TITLE = "New Comments on Knowledge Hub";

	private final int MAIL_SLEEP_TIME = 2000;

	private SimpleDateFormat sdf = new SimpleDateFormat(CommonConstants.TIME_FORMAT_2);

	{
		try {
			IMG_KH_LOGO = transImgToBase64("kh_logo.png");
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}
	}

	@Scheduled(cron = "0 0 23 * * *")
	public void cronJobSch() {

		// check lock and select job table
		try {
			if (lockRepository.getFreeLock().compareTo(BigInteger.ONE) == 0
					&& lockRepository.getLock().compareTo(BigInteger.ONE) == 0) {
				try {
					logger.info("[" + InetAddress.getLocalHost().getHostName() + "] start job....");
					KhJob job = jobRepository.findById(CommonConstants.NOTIFY_JOB_NAME).orElse(null);
					if (job == null) {
						job = new KhJob();
						job.setJobName(CommonConstants.NOTIFY_JOB_NAME);
						job.setPeriodStartTime(LocalDateTime.now());
					}
					job.setLocakBy(InetAddress.getLocalHost().getHostName());
					job.setUpdateTime(LocalDateTime.now());
					jobRepository.save(job);

					LocalDateTime jobEndTime = LocalDateTime.now().minusMinutes(JOB_BUFFER_MINS);

					List<Tuple> newPosts = notebookRepository.findNotebookByCreateTime(job.getPeriodStartTime(),
							jobEndTime, CommonConstants.RECORD_STATUS_PUBLISH);
					logger.info("Job period => " + DateUtil.dateTimeFormat(job.getPeriodStartTime()) + " to "
							+ DateUtil.dateTimeFormat(jobEndTime) + ", new post count ="
							+ (CollectionUtils.isEmpty(newPosts) ? 0 : newPosts.size()));

					if (!CollectionUtils.isEmpty(newPosts)) {
						for (Tuple recipient : khAuthorRepository.findUserListForPostNotif(
								CommonConstants.USER_STATUS_IS_ACTIVE, CommonConstants.POST_NOTIF_IS_ACTIVE)) {
							try {
								sendPostNft(recipient, newPosts);
								Thread.sleep(MAIL_SLEEP_TIME);
							} catch (Exception e) {
								logger.error("send post notify => " + (String) recipient.get("author_id")
										+ " has error! " + e.getMessage(), e);
							}
						}
					}

					for (Tuple ntfInfo : notebookRepository.findNotebookHavingComment(job.getPeriodStartTime(),
							jobEndTime, CommonConstants.RECORD_STATUS_PUBLISH, CommonConstants.USER_STATUS_IS_ACTIVE,
							CommonConstants.COMMENT_NOTIF_IS_ACTIVE)) {

						try {
							Map<String, Object[]> commentContent = new HashMap<String, Object[]>();
							int commentCnt = 0;
							for (String notebookId : ((String) ntfInfo.get("notebook_id")).split(",")) {
								Tuple nb = notebookRepository.findKeyAttributes(notebookId,
										CommonConstants.RECORD_STATUS_PUBLISH);
								List<Tuple> comments = commentRepository.findCommentsByNotebookIdCreateTime(notebookId,
										job.getPeriodStartTime(), jobEndTime);
								Object[] commentInfo = new Object[2];
								commentInfo[0] = (String) nb.get("notebook_title");
								commentInfo[1] = comments;
								commentCnt += comments.size();
								commentContent.put(notebookId, commentInfo);
							}
							sendCommentNft(ntfInfo, commentContent, commentCnt);
							Thread.sleep(MAIL_SLEEP_TIME);
						} catch (Exception e) {
							logger.error("send comment notify => " + (String) ntfInfo.get("author_id") + " has error! "
									+ e.getMessage(), e);
						}
					}

					job.setPeriodStartTime(jobEndTime);
					job.setLocakBy(null);
					job.setUpdateTime(LocalDateTime.now());
					jobRepository.save(job);

				} catch (Exception e) {
					logger.error(e.getMessage(), e);
				} finally {
					lockRepository.releaseLock();
					logger.info("[" + InetAddress.getLocalHost().getHostName() + "] finish job....");
				}
			} else {
				logger.info("[" + InetAddress.getLocalHost().getHostName() + "] I don't get the lock!");
			}
			;
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}
	}

	private void sendPostNft(Tuple recipient, List<Tuple> posts) {
		MimeMessagePreparator messagePreparator = mimeMessage -> {
			MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage);
			messageHelper.setFrom(mailSender, mailSenderName);
			messageHelper.setTo((String) recipient.get("author_id") + CommonConstants.RAKUTEN_EMAIL);
			messageHelper.setSubject((posts.size() > 1 ? NEW_POSTS_MAIL_TITLE : NEW_POST_MAIL_TITLE));

			StringBuilder content = new StringBuilder();
			appendString(content, "<!DOCTYPE html><head><meta charset=\"UTF-8\">");
			appendString(content, "<style>");
			appendString(content,
					"div { font-family: Lato,Helvetica Neue,Arial,Helvetica,sans-serif; font-style: normal; font-weight: normal;}");
			appendString(content, ".welcome {height: 58px; left: 40px; right: 40px; top: 121px;"
					+ "font-size: 20px; line-height: 15px; color: #3B444F; margin-top: 40.18px; margin-bottom: 20px; white-space: pre;}");
			appendString(content,
					".notification {margin-top: 20px; font-size: 14px; line-height: 20px; color: #636C77;}");
			appendString(content, ".title {font-weight: 500; font-size: 20px; line-height: 24px; color: #1E2631;}");
			appendString(content, ".author {margin-top: 5px; font-size: 14px; line-height: 17px; color: #9299A3;}");
			appendString(content, ".subtitle {margin-top: 5px; font-size: 16px; line-height: 19px; color: #3B444F;}");
			appendString(content,
					".card {margin-top:10px; border: 1px solid #DFE2E6; width: 720px; box-sizing: border-box; border-radius: 4px; padding: 24px;}");
			appendString(content, "</style>");
			appendString(content,
					"<body><div style=\"margin:40px\">" + "<a style=\"display:block; text-decoration:none;\" href=\""
							+ khUrl + "\">" + "<div><img src=\"data:image/png;base64," + IMG_KH_LOGO
							+ "\" width=\"200px\" height=\"40.82px\"></img></div></a>");
			appendString(content, appendPostNft((String) recipient.get("author_name"), posts));
			appendString(content, "</body></html>");
			messageHelper.setText(content.toString(), true);
		};
		sender.send(messagePreparator);
	}

	private String appendPostNft(String receiver, List<Tuple> posts) {
		StringBuilder content = new StringBuilder();
		appendString(content, "<div class=\"welcome\">Hi " + receiver + ",<br>");
		if (posts.size() == 1) {
			appendString(content, "There is a new post on Knowledge Hub</div>");
		} else {
			appendString(content, "There are <strong>" + posts.size() + " new posts</strong> on Knowledge Hub</div>");
		}
		appendString(content, appendPosts(posts) + "<hr style = \"background-color: #DFE2E6; margin-top: 56.17px;\">");
		appendString(content, "<div class=\"notification\">Unsubscribe or update your email preferences in <a href=\""
				+ notificationUrl + "\" style=\"color:#992679;\">Settings</a></div>");
		return content.toString();
	}

	private String appendPosts(List<Tuple> posts) {
		StringBuilder content = new StringBuilder();
		posts.forEach(p -> {
			appendString(content, "<a style=\"display:block; text-decoration:none;\" href=\"" + notebookUrl
					+ p.get("notebook_id") + "\">" + "<div class=\"card\">");
			appendString(content, "<div class=\"title\">" + p.get("notebook_title") + "</div>");
			appendString(content, "<div class=\"author\">" + p.get("authors") + "</div>");
			if (p.get("notebook_subtitle") != null) {
				appendString(content, "<div class=\"subtitle\">" + p.get("notebook_subtitle") + "</div>");
			}
			appendString(content, "</div></a>");
		});
		return content.toString();
	}

	private void appendString(StringBuilder builder, String value) {
		builder.append(value + System.lineSeparator());
	}

	private String transImgToBase64(String fileName) throws IOException {
		ResourceLoader loader = new DefaultResourceLoader();
		Resource resource = loader.getResource("classpath:" + fileName);
		return Base64.getEncoder().encodeToString(IOUtils.toByteArray(resource.getInputStream()));
	}

	private void sendCommentNft(Tuple recipient, Map<String, Object[]> commentInfos, int commentCnt) {
		MimeMessagePreparator messagePreparator = mimeMessage -> {
			MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage);
			messageHelper.setFrom(mailSender, mailSenderName);
			messageHelper.setTo((String) recipient.get("author_id") + CommonConstants.RAKUTEN_EMAIL);
			messageHelper.setSubject((commentCnt > 1 ? NEW_COMMENTS_MAIL_TITLE : NEW_COMMENT_MAIL_TITLE));

			StringBuilder content = new StringBuilder();
			appendString(content, "<!DOCTYPE html><head><meta charset=\"UTF-8\">");
			appendString(content, "<style>");
			appendString(content,
					"div { font-family: Lato,Helvetica Neue,Arial,Helvetica,sans-serif; font-style: normal; font-weight: normal;}");
			appendString(content, ".welcome {height: 58px; left: 40px; right: 40px; top: 121px;"
					+ "font-size: 20px; line-height: 15px; color: #3B444F; margin-top: 40.18px; white-space: pre-wrap;}");
			appendString(content,
					".title {margin-top:22px; margin-bottom:20px; font-weight: 500; font-size: 20px; line-height: 17px; color: #3B444F;}");
			appendString(content, ".author {margin-top: 1px; font-size: 14px; line-height: 14px; color: #9299A3;}");
			appendString(content, ".comment {margin-top: 12px; font-size: 14px; line-height: 19px; color: #3B444F;}");
			appendString(content,
					".card {margin-top:10px; margin-bottom:10px; border: 1px solid #DFE2E6; width: 720px; box-sizing: border-box; border-radius: 4px; padding: 24px;}");
			appendString(content,
					".button {margin-bottom: 40px; border-radius: 4px; box-sizing: border-box; border: 1px solid #5A9E3E; background: #78BC5C; width: 150px; height: 40px; font-size: 14px; line-height: 40px; color: #FFFFFF; text-align: center;}");
			appendString(content,
					".notification {margin-top: 20px; font-size: 14px; line-height: 20px; color: #636C77;}");
			appendString(content, "</style>");
			appendString(content,
					"<body><div style=\"margin:40px\">" + "<a style=\"display:block; text-decoration:none;\" href=\""
							+ khUrl + "\">" + "<div><img src=\"data:image/png;base64," + IMG_KH_LOGO
							+ "\" width=\"200px\" height=\"40.82px\"></img></div></a>");

			if (commentCnt == 1) {
				appendString(content, appendCommentNft((String) recipient.get("author_name"), commentInfos));
			} else {
				appendString(content,
						appendMultiComments((String) recipient.get("author_name"), commentInfos, commentCnt));
			}
			appendString(content, "<hr style = \"background-color: #DFE2E6; margin-top: 56.17px;\">");
			appendString(content,
					"<div class=\"notification\">Unsubscribe or update your email preferences in <a href=\""
							+ notificationUrl + "\" style=\"color:#992679;\">Settings</a></div>");
			appendString(content, "</body></html>");

			messageHelper.setText(content.toString(), true);
		};
		sender.send(messagePreparator);
	}

	private String appendCommentNft(String receiver, Map<String, Object[]> commentContent) {
		StringBuilder content = new StringBuilder();
		appendString(content, "<div class=\"welcome\">Hi " + receiver + ",<br>");
		appendString(content, "You have a new comment on your post <strong>"
				+ commentContent.entrySet().iterator().next().getValue()[0] + "</strong></div>");
		appendString(content, appendComments(commentContent));
		return content.toString();
	}

	private String appendMultiComments(String receiver, Map<String, Object[]> commentContent, int commentCnt) {
		StringBuilder content = new StringBuilder();
		appendString(content, "<div class=\"welcome\">Hi " + receiver + ",<br>");
		appendString(content, "You have <strong>" + commentCnt + " new comments</strong></div>");
		appendString(content, appendComments(commentContent));
		return content.toString();
	}

	@SuppressWarnings("unchecked")
	private String appendComments(Map<String, Object[]> commentContent) {
		StringBuilder content = new StringBuilder();

		commentContent.forEach((notebookId, commentInfo) -> {
			appendString(content, "<div class=\"title\">" + commentInfo[0] + "</div>");
			((List<Tuple>) commentInfo[1]).forEach(comment -> {
				appendString(content, "<div class=\"card\">");
				appendString(content, "<div class=\"author\">" + (String) comment.get("user_name") + "</div>");
				appendString(content,
						"<div class=\"author\">" + sdf.format((Timestamp) comment.get("create_time")) + "</div>");
				appendString(content, "<div class=\"comment\">" + (String) comment.get("comment") + "</div>");
				appendString(content, "</div>");
			});
			appendString(content,
					"<a href=\"" + notebookUrl + notebookId
							+ "#comments\" style=\"text-decoration:none; margin-bottom:20px;\">"
							+ "<div class=\"button\">Go to check out</div></a>");
		});
		return content.toString();
	}
}
