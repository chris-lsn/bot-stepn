import { ConfigService } from "../services/configService";
import { SheetService } from "../services/sheetService";
import { StepnAnalyzer } from "../services/stepnService";

export abstract class BasePlatform {
    protected readonly config: ConfigService = ConfigService.Instance
    protected readonly sheet: SheetService = SheetService.Instance
    protected readonly analyzer: StepnAnalyzer

    constructor() {
        this.analyzer = new StepnAnalyzer(this.config.googleCredentials)
    }

    public abstract listen(): void;
}