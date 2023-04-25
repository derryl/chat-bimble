// TODO: if I can figure out a healthy way of abstracting Stream response logic, put the abstractions here

type SendEventDataPayload = {
  controller: ReadableStreamDefaultController;
  data: any;
  encoder: TextEncoder;
  event: string;
};

export const sendEventData = ({
  controller,
  data,
  encoder,
  event,
}: SendEventDataPayload) => {
  controller.enqueue(encoder.encode(`event: ${event}\n`));
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
};
