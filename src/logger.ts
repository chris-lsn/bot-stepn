import { createLogger, transports, format } from "winston";

export default createLogger({
    transports: [new transports.Console()],
    format: format.combine(
      format.colorize(),
      format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level}: ${message}`;
      })
    ),
  }); 