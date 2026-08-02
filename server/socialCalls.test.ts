import { beforeEach, describe, expect, it } from "vitest";
import {
  createSocialCall,
  endSocialCall,
  getIncomingSocialCall,
  getSocialCall,
  resetSocialCallsForTests,
  respondToSocialCall,
  signalSocialCall,
} from "./socialCalls";

describe("social call signaling", () => {
  beforeEach(() => resetSocialCallsForTests());

  it("creates an authenticated incoming audio or video call", () => {
    const call = createSocialCall(10, 20, "video");
    expect(call.status).toBe("ringing");
    expect(getIncomingSocialCall(20)?.id).toBe(call.id);
    expect(getIncomingSocialCall(10)).toBeNull();
  });

  it("exchanges offers, answers, and ICE candidates only between participants", () => {
    const call = createSocialCall(10, 20, "audio");
    signalSocialCall(call.id, 10, { type: "offer", sdp: "offer-sdp" });
    signalSocialCall(call.id, 10, { type: "candidate", candidate: "caller-candidate" });
    respondToSocialCall(call.id, 20, true);
    signalSocialCall(call.id, 20, { type: "answer", sdp: "answer-sdp" });
    const state = getSocialCall(call.id, 10);
    expect(state.offer).toBe("offer-sdp");
    expect(state.answer).toBe("answer-sdp");
    expect(state.candidates[0]?.candidate).toBe("caller-candidate");
    expect(() => getSocialCall(call.id, 30)).toThrow("Call not found");
  });

  it("supports declining and ending calls", () => {
    const declined = createSocialCall(10, 20, "audio");
    expect(respondToSocialCall(declined.id, 20, false).status).toBe("declined");
    resetSocialCallsForTests();
    const accepted = createSocialCall(10, 20, "video");
    respondToSocialCall(accepted.id, 20, true);
    endSocialCall(accepted.id, 10);
    expect(getSocialCall(accepted.id, 20).status).toBe("ended");
  });
});
