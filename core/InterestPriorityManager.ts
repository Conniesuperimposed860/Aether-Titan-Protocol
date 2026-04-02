import { InterestManager } from './InterestManager';

export class InterestPriorityManager {
    private interest = new InterestManager();
    private priorities = new Map<string, number>();

    setInterest(area: { id: string; x: number; y: number; radius: number }): void {
        this.interest.addArea(area);
    }

    setPriority(id: string, priority: number): void {
        this.priorities.set(id, priority);
    }

    getVisible(x: number, y: number, minPriority = 0): string[] {
        const interested = this.interest.getInterested(x, y);
        return interested.filter(id => (this.priorities.get(id) ?? 0) >= minPriority);
    }
}
