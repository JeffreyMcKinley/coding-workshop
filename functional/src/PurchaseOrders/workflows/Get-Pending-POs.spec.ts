import { constructPORepository } from "../domain/PORepository"
import { getPendingPOs } from "./Get-Pending-POs";

describe("Get Pending POs Workflow", () => {
    it('is callable', () => {
        const repo = constructPORepository();
        getPendingPOs({ DraftPORepo: repo });
    });

    it('returns a list of pending purchase orders', async () => {
        const repo = constructPORepository();
        const result = getPendingPOs({ DraftPORepo: repo });
        //TODO: Add expect here for it to return
    })
})