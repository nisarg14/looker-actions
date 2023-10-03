import * as Hub from "../../../../hub";
import { DV360ActionRequest } from "./dv_request";

interface DVCustomer {
    resourceName: string;
    manager: boolean;
    descriptiveName: string;
    id: string;
};

export class DV360ActionFormBuilder {

    readonly apiClient = this.dvRequest.apiClient!;
    readonly dvAdvertiserId = this.dvRequest.dvAdvertiserId;
    loginCustomer?: DVCustomer;
    targetCustomer?: DVCustomer;

    constructor(readonly dvRequest: DV360ActionRequest) { }

    async makeForm() {
        const form = new Hub.ActionForm();

        form.fields.push({
            name: "dvAdvertiserId",
            label: "Advertiser ID",
            type: "string",
            description: "Get this value form the Display & Video 360",
            required: true,
        });

        form.fields.push({
            name: "dvDisplayName",
            label: "Display Name",
            type: "string",
            description: "Enter the Display Name",
            required: true,
        });

        form.fields.push({
            name: "dvAudienceType",
            label: "Audience Type",
            description: "Select Audience Type (Contact Info/Mobile Device Ids)",
            type: "select",
            options: [
                { name: "contactInfo", label: "Contact Info" },
                { name: "mobileDeviceIds", label: "Mobile Device IDs" },
            ],
            required: true,
        });

        return form;
    };
};