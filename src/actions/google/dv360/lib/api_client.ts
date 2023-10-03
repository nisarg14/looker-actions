import * as gaxios from "gaxios";
import * as lodash from "lodash";
import { sanitizeError as sanitize } from "../../common/error_utils";
import { Logger } from "../../common/logger";

export class DV360ApiClient {
    constructor(readonly log: Logger, readonly accessToken: string,
        readonly developerToken: string, readonly loginCid?: string) { }

    async createDataJob(advertiserId: string, displayName: string, audienceType: string, hashedEmails: []) {
        const method = "POST";
        const path = `firstAndThirdPartyAudiences?advertiserId=${advertiserId}`;
        const body = {
            displayName,
            firstAndThirdPartyAudienceType: "FIRST_AND_THIRD_PARTY_AUDIENCE_TYPE_FIRST_PARTY",
            audienceType,
            membershipDurationDays: 10000,
            contactInfoList: {
                contactInfos: [{
                    hashedEmails
                }],
            },
        };

        return this.apiCall(method, path, body);
    };

    async apiCall(method: "GET" | "POST", url: string, data?: any) {
        const headers: any = {
            "developer-token": this.developerToken,
            "Authorization": `Bearer ${this.accessToken}`,
        };
        if (this.loginCid) {
            headers["login-customer-id"] = this.loginCid;
        }
        const response = await gaxios.request<any>({
            method,
            url,
            data,
            headers,
            baseURL: "https://displayvideo.googleapis.com/v2/"
        });

        if (process.env.ACTION_HUB_DEBUG) {
            const apiResponse = lodash.cloneDeep(response);
            sanitize(apiResponse);
            this.log("debug", `Response from ${url}: ${JSON.stringify(apiResponse)}`);
        }

        return response.data;
    }
};
