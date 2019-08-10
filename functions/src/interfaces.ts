import { DialogflowConversation, Contexts } from "actions-on-google";

type Conversation = DialogflowConversation<unknown, unknown, Contexts>;

enum LastResult {
  succeeded,
  failed
}

export { Conversation, LastResult };
