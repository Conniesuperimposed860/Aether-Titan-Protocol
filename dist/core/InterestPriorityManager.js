import { InterestManager } from './InterestManager';
export class InterestPriorityManager {
    constructor() {
        this.interest = new InterestManager();
        this.priorities = new Map();
    }
    setInterest(area) {
        this.interest.addArea(area);
    }
    setPriority(id, priority) {
        this.priorities.set(id, priority);
    }
    getVisible(x, y, minPriority = 0) {
        const interested = this.interest.getInterested(x, y);
        return interested.filter(id => (this.priorities.get(id) ?? 0) >= minPriority);
    }
}
