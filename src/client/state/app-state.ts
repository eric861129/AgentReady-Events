export class AppState {
  private version = 0;
  selectedEventId: string | undefined;

  selectEvent(eventId: string) {
    this.selectedEventId = eventId;
    this.version += 1;
  }

  stateVersion() {
    return this.version;
  }
}
