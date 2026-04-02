export declare class InterestPriorityManager {
    private interest;
    private priorities;
    setInterest(area: {
        id: string;
        x: number;
        y: number;
        radius: number;
    }): void;
    setPriority(id: string, priority: number): void;
    getVisible(x: number, y: number, minPriority?: number): string[];
}
