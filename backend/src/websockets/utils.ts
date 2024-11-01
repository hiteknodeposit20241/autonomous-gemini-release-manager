export const connections = new Set<(data: any) => void>();

export const broadcast = (eventData: any) => {
  connections.forEach((sendEvent) => {
    sendEvent(eventData);
  });
};
