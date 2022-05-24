import { Config } from "../config";
import { Sheet } from "../sheet";
import { StepnAnalyzer } from "../stepn";

export abstract class BasePlatform {
    protected readonly config: Config 
    protected readonly analyzer: StepnAnalyzer
    protected readonly sheet: Sheet

    constructor() {
        this.config = Config.getInstance();
        this.analyzer = new StepnAnalyzer(this.config.googleCredentials)
        this.sheet = new Sheet(this.config.sheetId, this.config.googleServiceAccount, this.config.googlePrivateKey)
    }

    public abstract listen(): void;
}