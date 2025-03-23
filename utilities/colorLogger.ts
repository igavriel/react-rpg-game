///////////////////////////////////////////////////////////////////////////////
// ColorLogger is a class that provides a colorized logger for the console
///////////////////////////////////////////////////////////////////////////////
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class ColorLogger {
  private static level: LogLevel = LogLevel.INFO;

  private static readonly COLORS = [
    '\x1b[36m', // Cyan for DEBUG
    '\x1b[32m', // Green for INFO
    '\x1b[33m', // Yellow for WARN
    '\x1b[31m', // Red for ERROR
  ] as const;

  private static readonly LEVEL_NAMES = ['DEBUG', 'INFO', 'WARN', 'ERROR'] as const;

  static setLevel(level: LogLevel) {
    this.level = level;
  }

  private static print(level: LogLevel, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const color = this.COLORS[level];
    const levelName = this.LEVEL_NAMES[level].padEnd(5); // Pad to 5 characters for alignment
    console.log(color, `${timestamp}|${levelName}|`, message, ...args, '\x1b[0m');
  }

  static debug(message: string, ...args: any[]) {
    if (this.level <= LogLevel.DEBUG) {
      this.print(LogLevel.DEBUG, message, ...args);
    }
  }

  static info(message: string, ...args: any[]) {
    if (this.level <= LogLevel.INFO) {
      this.print(LogLevel.INFO, message, ...args);
    }
  }

  static warn(message: string, ...args: any[]) {
    if (this.level <= LogLevel.WARN) {
      this.print(LogLevel.WARN, message, ...args);
    }
  }

  static error(message: string, ...args: any[]) {
    if (this.level <= LogLevel.ERROR) {
      this.print(LogLevel.ERROR, message, ...args);
    }
  }
}

// Test the ColorLogger
///////////////////////////////////////////////////////////////////////////////
// ColorLogger.debug("Hello, world!");
// ColorLogger.info("Hello, world!");
// ColorLogger.warn("Hello, world!");
// ColorLogger.error("Hello, world!");
// ColorLogger.setLevel(LogLevel.DEBUG);
// ColorLogger.debug("Hello, world!");
///////////////////////////////////////////////////////////////////////////////
