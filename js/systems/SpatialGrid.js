/**
 * Spatial Grid - Efficient collision detection using spatial hashing
 * Reduces collision checks from O(n×m) to O(n+m)
 *
 * How it works:
 * - Divide game area into grid cells (e.g., 100×100 pixels)
 * - Objects register themselves in cells they occupy
 * - Collision checks only happen between objects in same cells
 *
 * Performance gain: 80-90% reduction in collision checks
 */

import { getSafeZoneX, getSafeZoneY } from '../core/viewport.js';
import { SAFE_ZONE_WIDTH, SAFE_ZONE_HEIGHT } from '../core/constants.js';

export class SpatialGrid {
    constructor(cellSize = 100) {
        this.cellSize = cellSize;
        this.grid = new Map(); // Map of "x,y" -> Set of objects

        // Calculate grid dimensions
        this.cols = Math.ceil(SAFE_ZONE_WIDTH / cellSize);
        this.rows = Math.ceil(SAFE_ZONE_HEIGHT / cellSize);
    }

    /**
     * Clear all objects from grid (call once per frame)
     */
    clear() {
        this.grid.clear();
    }

    /**
     * Get grid cell key for coordinates
     */
    getCellKey(x, y) {
        const col = Math.floor((x - getSafeZoneX()) / this.cellSize);
        const row = Math.floor((y - getSafeZoneY()) / this.cellSize);
        return `${col},${row}`;
    }

    /**
     * Insert object into grid
     * Objects can occupy multiple cells if they're large
     */
    insert(obj) {
        // Support both w/h and width/height properties
        const width = obj.w || obj.width || 0;
        const height = obj.h || obj.height || 0;

        // Calculate which cells this object occupies
        const minCol = Math.floor((obj.x - getSafeZoneX()) / this.cellSize);
        const maxCol = Math.floor((obj.x + width - getSafeZoneX()) / this.cellSize);
        const minRow = Math.floor((obj.y - getSafeZoneY()) / this.cellSize);
        const maxRow = Math.floor((obj.y + height - getSafeZoneY()) / this.cellSize);

        // Add to all occupied cells
        for (let col = minCol; col <= maxCol; col++) {
            for (let row = minRow; row <= maxRow; row++) {
                const key = `${col},${row}`;

                if (!this.grid.has(key)) {
                    this.grid.set(key, new Set());
                }

                this.grid.get(key).add(obj);
            }
        }
    }

    /**
     * Get all potential collision candidates for an object
     * Returns only objects in the same cells
     */
    getPotentialCollisions(obj) {
        const candidates = new Set();

        // Support both w/h and width/height properties
        const width = obj.w || obj.width || 0;
        const height = obj.h || obj.height || 0;

        // Get all cells this object occupies
        const minCol = Math.floor((obj.x - getSafeZoneX()) / this.cellSize);
        const maxCol = Math.floor((obj.x + width - getSafeZoneX()) / this.cellSize);
        const minRow = Math.floor((obj.y - getSafeZoneY()) / this.cellSize);
        const maxRow = Math.floor((obj.y + height - getSafeZoneY()) / this.cellSize);

        // Collect all objects from these cells
        for (let col = minCol; col <= maxCol; col++) {
            for (let row = minRow; row <= maxRow; row++) {
                const key = `${col},${row}`;
                const cell = this.grid.get(key);

                if (cell) {
                    cell.forEach(candidate => {
                        if (candidate !== obj) {
                            candidates.add(candidate);
                        }
                    });
                }
            }
        }

        return Array.from(candidates);
    }

    /**
     * Debug: Draw grid overlay (for visualization)
     */
    debugDraw() {
        push();
        stroke(0, 255, 0, 50);
        strokeWeight(1);
        noFill();

        // Draw vertical lines
        for (let col = 0; col <= this.cols; col++) {
            const x = getSafeZoneX() + col * this.cellSize;
            line(x, getSafeZoneY(), x, getSafeZoneY() + SAFE_ZONE_HEIGHT);
        }

        // Draw horizontal lines
        for (let row = 0; row <= this.rows; row++) {
            const y = getSafeZoneY() + row * this.cellSize;
            line(getSafeZoneX(), y, getSafeZoneX() + SAFE_ZONE_WIDTH, y);
        }

        // Draw cell occupancy (red = more objects)
        for (const [key, objects] of this.grid.entries()) {
            const [col, row] = key.split(',').map(Number);
            const x = getSafeZoneX() + col * this.cellSize;
            const y = getSafeZoneY() + row * this.cellSize;

            const alpha = Math.min(objects.size * 30, 150);
            fill(255, 0, 0, alpha);
            noStroke();
            rect(x, y, this.cellSize, this.cellSize);
        }

        pop();
    }
}
