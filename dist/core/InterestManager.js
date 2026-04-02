export class InterestManager {
    constructor() {
        this.areas = [];
    }
    addArea(area) {
        this.areas.push(area);
    }
    clear() {
        this.areas = [];
    }
    getInterested(x, y) {
        return this.areas
            .filter(a => {
            const dx = a.x - x;
            const dy = a.y - y;
            return dx * dx + dy * dy <= a.radius * a.radius;
        })
            .map(a => a.id);
    }
}
