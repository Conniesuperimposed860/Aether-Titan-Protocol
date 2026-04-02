export interface InterestArea {
    id: string;
    x: number;
    y: number;
    radius: number;
}

export class InterestManager {
    private areas: InterestArea[] = [];

    addArea(area: InterestArea): void {
        this.areas.push(area);
    }

    clear(): void {
        this.areas = [];
    }

    getInterested(x: number, y: number): string[] {
        return this.areas
            .filter(a => {
                const dx = a.x - x;
                const dy = a.y - y;
                return dx * dx + dy * dy <= a.radius * a.radius;
            })
            .map(a => a.id);
    }
}
