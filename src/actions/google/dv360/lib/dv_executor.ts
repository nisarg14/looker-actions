import { DV360ActionRequest } from "./dv_request";

export class DV360ActionExecutor {
    readonly apiClient = this.dvRequest.apiClient!;
    readonly log = this.dvRequest.log;

    constructor(readonly dvRequest: DV360ActionRequest) { }

    
};