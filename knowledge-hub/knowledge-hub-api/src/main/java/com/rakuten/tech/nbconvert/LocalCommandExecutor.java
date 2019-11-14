package com.rakuten.tech.nbconvert;

/**
 * LocalCommandExecutor
 * 
 * @author chienchang.a.huang
 */
public interface LocalCommandExecutor {
    ExecuteResult executeCommand(String[] command, long timeout);
}