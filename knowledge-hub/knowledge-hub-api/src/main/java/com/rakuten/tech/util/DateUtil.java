package com.rakuten.tech.util;

import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;

import com.rakuten.tech.constants.CommonConstants;

/**
 * Date utility for date formating
 * 
 * @author chienchang.a.huang
 */
public class DateUtil {

	private static DateTimeFormatter df = DateTimeFormatter.ofPattern(CommonConstants.TIME_FORMAT_1);

	private static SimpleDateFormat sdf = new SimpleDateFormat(CommonConstants.TIME_FORMAT_1);

	public static String dateTimeFormat(LocalDateTime dateTime) {
		return df.format(dateTime);
	}

	public static Date stringToDate(String dateTime) throws ParseException {
		return sdf.parse(dateTime);
	}

	public static LocalDateTime stringToLocalDate(String strDateTime) {
		return LocalDateTime.parse(strDateTime, df);
	}

	public static String dateTimeFormat(Timestamp dateTime) {
		return sdf.format(dateTime);
	}
}
