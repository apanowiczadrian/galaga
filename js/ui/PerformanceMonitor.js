import { getSafeZoneX, getSafeZoneY } from '../core/viewport.js';

/**
 * Performance Monitor - FPS Counter and Profiler
 * Lightweight, always-visible performance metrics
 */
export class PerformanceMonitor {
    constructor() {
        this.enabled = false; // Disabled by default for performance (press P to toggle)

        // FPS tracking
        this.fps = 60;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.fpsHistory = [];

        // Performance profiling
        this.profiles = {
            player: { time: 0, calls: 0 },
            enemies: { time: 0, calls: 0 },
            projectiles: { time: 0, calls: 0 },
            collision: { time: 0, calls: 0 },
            powerups: { time: 0, calls: 0 },
            comets: { time: 0, calls: 0 },
            ui: { time: 0, calls: 0 },
            other: { time: 0, calls: 0 }
        };

        // Current measurement
        this.currentMeasurement = null;
        this.measurementStart = 0;

        // Stats for display
        this.totalFrameTime = 0;
        this.heaviestTask = 'N/A';
        this.heaviestTaskPercent = 0;
    }

    /**
     * Start measuring a specific task
     * @param {string} taskName - Name of the task (e.g., 'player', 'enemies')
     */
    startMeasure(taskName) {
        if (!this.enabled) return;
        this.currentMeasurement = taskName;
        this.measurementStart = performance.now();
    }

    /**
     * End measurement of current task
     */
    endMeasure() {
        if (!this.enabled || !this.currentMeasurement) return;

        const elapsed = performance.now() - this.measurementStart;
        const task = this.currentMeasurement;

        if (this.profiles[task]) {
            this.profiles[task].time += elapsed;
            this.profiles[task].calls++;
        }

        this.currentMeasurement = null;
    }

    /**
     * Update FPS and calculate heaviest task
     */
    update(deltaTime) {
        if (!this.enabled) return;

        // Update FPS
        this.frameCount++;
        const currentTime = performance.now();

        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.fpsHistory.push(this.fps);
            if (this.fpsHistory.length > 60) this.fpsHistory.shift();

            // Calculate total frame time and find heaviest task
            this.totalFrameTime = 0;
            let maxTime = 0;
            let maxTask = 'N/A';

            for (const [taskName, data] of Object.entries(this.profiles)) {
                this.totalFrameTime += data.time;
                if (data.time > maxTime) {
                    maxTime = data.time;
                    maxTask = taskName;
                }
            }

            // Calculate percentage
            if (this.totalFrameTime > 0) {
                this.heaviestTaskPercent = (maxTime / this.totalFrameTime * 100).toFixed(1);
                this.heaviestTask = maxTask.toUpperCase();
            }

            // Reset counters for next second
            for (const task of Object.values(this.profiles)) {
                task.time = 0;
                task.calls = 0;
            }

            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
    }

    /**
     * Draw performance stats in top-left corner
     */
    draw() {
        if (!this.enabled) return;

        push();

        // Compact background
        fill(0, 0, 0, 180);
        noStroke();
        rect(getSafeZoneX() + 5, getSafeZoneY() + 5, 180, 80, 5);

        // FPS with color coding
        const avgFps = this.fpsHistory.length > 0
            ? Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length)
            : this.fps;

        const fpsColor = this.fps >= 55 ? [0, 255, 0] :
                        this.fps >= 30 ? [255, 255, 0] : [255, 0, 0];

        textAlign(LEFT, TOP);
        textFont('Rajdhani, Arial, sans-serif');

        // FPS (larger)
        fill(...fpsColor);
        textSize(24);
        textStyle(BOLD);
        text(`${this.fps} FPS`, getSafeZoneX() + 15, getSafeZoneY() + 12);

        // Average FPS (smaller)
        textSize(12);
        textStyle(NORMAL);
        fill(200, 200, 200);
        text(`avg: ${avgFps}`, getSafeZoneX() + 15, getSafeZoneY() + 38);

        // Heaviest task
        textSize(11);
        fill(255, 180, 100);
        text(`Heavy: ${this.heaviestTask}`, getSafeZoneX() + 15, getSafeZoneY() + 54);

        // Percentage
        textSize(11);
        fill(255, 150, 150);
        text(`${this.heaviestTaskPercent}% frame`, getSafeZoneX() + 15, getSafeZoneY() + 68);

        pop();
    }

    /**
     * Get detailed profile report (for console logging)
     */
    getReport() {
        const report = {
            fps: this.fps,
            avgFps: this.fpsHistory.length > 0
                ? Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length)
                : this.fps,
            totalFrameTime: this.totalFrameTime.toFixed(2) + 'ms',
            tasks: {}
        };

        for (const [taskName, data] of Object.entries(this.profiles)) {
            if (data.time > 0) {
                const percent = (data.time / this.totalFrameTime * 100).toFixed(1);
                report.tasks[taskName] = {
                    time: data.time.toFixed(2) + 'ms',
                    calls: data.calls,
                    percent: percent + '%'
                };
            }
        }

        return report;
    }

    /**
     * Toggle performance monitor on/off
     */
    toggle() {
        this.enabled = !this.enabled;
    }
}
