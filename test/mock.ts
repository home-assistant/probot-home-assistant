const log = () => undefined;
log.trace = () => undefined;
log.debug = () => undefined;
log.info = () => undefined;
log.warn = () => undefined;
log.error = () => undefined;
log.fatal = () => undefined;
log.child = () => log;

export { log };
