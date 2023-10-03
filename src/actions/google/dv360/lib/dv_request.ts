import { Credentials } from "google-auth-library";
import * as Hub from "../../../../hub";
import { Logger } from "../../common/logger";
import { DV360CustomerMatch } from "../customer_match";
import { safeParseJson } from "../../common/utils";
import { MissingAuthError } from "../../common/missing_auth_error";
import { DV360ApiClient } from "./api_client";
import { DV360ActionFormBuilder } from "./dv_form_builder";
import { MissingRequiredParamsError } from "../../common/missing_required_params_error";

interface DVUserState {
    tokens: Credentials;
    redirect: string;
};

export class DV360ActionRequest {
    static async fromHub(hubRequest: Hub.ActionRequest, action: DV360CustomerMatch, logger: Logger) {
        const adsReq = new DV360ActionRequest(hubRequest, action, logger);
        await adsReq.checkTokens();
        adsReq.setApiClient();
        return adsReq;
    }

    readonly streamingDownload = this.hubRequest.stream.bind(this.hubRequest);
    apiClient?: DV360ApiClient;
    formParams: any;
    userState: DVUserState;
    webhookId?: string;

    constructor(
        readonly hubRequest: Hub.ActionRequest,
        readonly actionInstance: DV360CustomerMatch,
        readonly log: Logger,
    ) {
        const state = safeParseJson(hubRequest.params.state_json);

        if (!state || !state.tokens || !state.tokens.access_token || !state.tokens.refresh_token || !state.redirect) {
            throw new MissingAuthError("User state was missing or did not contain oauth tokens & redirect");
        }

        this.userState = state;
        this.formParams = hubRequest.formParams;
        this.webhookId = hubRequest.webhookId;
    }

    async checkTokens() {
        // adding 5 minutes to expiry_date check to handle refresh edge case
        if (this.userState.tokens.expiry_date == null || this.userState.tokens.expiry_date < (Date.now() + 5 * 60000)) {
            this.log("debug", "Tokens appear expired; attempting refresh.");

            const data = await this.actionInstance.oauthHelper.refreshAccessToken(this.userState.tokens);

            if (!data || !data.access_token || !data.expiry_date) {
                throw new MissingAuthError("Could not refresh tokens");
            }

            this.userState.tokens.access_token = data.access_token;
            this.userState.tokens.expiry_date = data.expiry_date;
            this.log("debug", "Set new tokens");
        }
    };

    setApiClient() {
        this.apiClient = new DV360ApiClient(this.log, this.accessToken, this.developerToken);
    };

    get accessToken() {
        return this.userState.tokens.access_token!;
    };

    get developerToken() {
        return this.actionInstance.developerToken;
    };

    get dvAdvertiserId() {
        return this.formParams.dvAdvertiserId
    };

    async makeForm() {
        const formBuilder = new DV360ActionFormBuilder(this);
        return formBuilder.makeForm();
    };

    async execute(hubReq: Hub.ActionRequest) {
        if (!this.dvAdvertiserId) {
            throw new MissingRequiredParamsError("Advertiser Id is missing");
        }

        const data = hubReq.attachment?.dataJSON;

        // call execute here
    };
};