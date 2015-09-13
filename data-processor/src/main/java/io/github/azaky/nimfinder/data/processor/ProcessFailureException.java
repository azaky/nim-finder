package io.github.azaky.nimfinder.data.processor;

public class ProcessFailureException extends Exception {

    public ProcessFailureException(String message) {
        super(message);
    }

    public ProcessFailureException(Throwable cause) {
        super(cause);
    }

    public ProcessFailureException(String message, Throwable cause) {
        super(message, cause);
    }

}
