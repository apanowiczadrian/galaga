import { getVirtualWidth, getVirtualHeight, isMobileDevice } from '../core/viewport.js';

export class GameOverScreen {
    constructor(game) {
        this.game = game;
        this.isMobile = isMobileDevice();
        this.pixelFont = game.pixelFont; // Font z game object

        // FAB button with heart icon (changed from rectangular Restart button)
        this.fabButton = {
            x: 80,           // Fixed position: left margin
            y: 80,           // Fixed position: top margin
            radius: 62.5,    // Diameter 125px = 5× bigger than gameplay hearts (25px)
            isHovered: false,
            pulsePhase: 0    // For heartbeat animation
        };

        // Message button with envelope icon (swinging animation)
        this.messageButton = {
            x: 80,           // Fixed position: left margin (same as heart)
            y: 300,          // Middle of screen height
            radius: 62.5,    // Same size as heart button
            isHovered: false
        };

        this.wastedAlpha = 0;
        this.wastedScale = 5.0;
        this.animationTime = 0;
        this.shakeTime = 0;
        this.shakeIntensity = 0;

        // Small screen detection for responsive layout
        this.isSmallScreen = false;

        this.setupLayout();
    }

    setupLayout() {
        const vw = getVirtualWidth();
        const vh = getVirtualHeight();

        // Detect small screens (iPhone 13 mini and similar)
        // Used for spacing adjustments in other parts of UI
        this.isSmallScreen = vh <= 620;

        // On mobile: position buttons between left edge and "W" letter of WASTED
        if (this.isMobile) {
            const centerX = vw / 2;
            const wastedSize = 100; // Mobile size from draw()
            const letterSpacing = wastedSize * 0.8;
            const totalTextWidth = 6 * letterSpacing; // 6 letters: W A S T E D
            const startX = centerX - totalTextWidth / 2; // Position of "W" letter

            // Center buttons between left edge (0) and "W" position
            const buttonX = startX / 2;

            this.fabButton.x = buttonX;
            this.messageButton.x = buttonX;
        }
    }

    reset() {
        // Reset animation state when showing screen
        this.wastedAlpha = 0;
        this.wastedScale = 5.0;
        this.animationTime = 0;
        this.shakeTime = 0;
        this.shakeIntensity = 0;
    }

    formatScore(score) {
        // Format number with space separators (123 456 789)
        return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    update(mouseX, mouseY, deltaTime) {
        const animationDuration = 0.45;

        // Animate WASTED text (fade in and scale down)
        if (this.animationTime < animationDuration) {
            this.animationTime += deltaTime || 0.016;
            const progress = Math.min(this.animationTime / animationDuration, 1);
            this.wastedAlpha = progress * 255;
            this.wastedScale = 5.0 - progress * 3.8; // Scale from 5.0 to 1.2

            // When animation finishes, trigger shake
            if (this.animationTime >= animationDuration) {
                this.shakeTime = 0.3;      // Shake for 0.3 seconds
                this.shakeIntensity = 15;  // Starting intensity of 15px
            }
        }

        // Update shake effect
        if (this.shakeTime > 0) {
            this.shakeTime -= deltaTime || 0.016;
            this.shakeIntensity = Math.max(0, this.shakeIntensity - (deltaTime || 0.016) * 50); // Decrease intensity
        }

        // Check if mouse is over FAB button (only on desktop for hover effect)
        // On mobile, we skip hover and check directly in handleClick()
        if (!this.isMobile) {
            // Check FAB button (heart)
            const dx = mouseX - this.fabButton.x;
            const dy = mouseY - this.fabButton.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.fabButton.radius) {
                this.fabButton.isHovered = true;
            } else {
                this.fabButton.isHovered = false;
            }

            // Check message button (envelope)
            const dxMsg = mouseX - this.messageButton.x;
            const dyMsg = mouseY - this.messageButton.y;
            const distanceMsg = Math.sqrt(dxMsg * dxMsg + dyMsg * dyMsg);

            if (distanceMsg < this.messageButton.radius) {
                this.messageButton.isHovered = true;
            } else {
                this.messageButton.isHovered = false;
            }
        }
    }

    handleClick(mouseX, mouseY) {
        // Check message button first (priority over restart)
        const dxMsg = mouseX - this.messageButton.x;
        const dyMsg = mouseY - this.messageButton.y;
        const distanceMsg = Math.sqrt(dxMsg * dxMsg + dyMsg * dyMsg);
        const isInMessageButton = distanceMsg < this.messageButton.radius;

        if (this.isMobile) {
            // Mobile: direct click detection for message button
            if (isInMessageButton) {
                this.handleMessageClick();
                return false; // Don't restart game
            }
        } else {
            // Desktop: use hover state for message button
            if (this.messageButton.isHovered) {
                this.handleMessageClick();
                return false; // Don't restart game
            }
        }

        // Circular click detection for FAB button (restart)
        const dx = mouseX - this.fabButton.x;
        const dy = mouseY - this.fabButton.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const isInButton = distance < this.fabButton.radius;

        if (this.isMobile) {
            // Mobile: direct click detection (no hover state needed)
            if (isInButton) {
                return true; // Signal to restart game
            }
        } else {
            // Desktop: use hover state
            if (this.fabButton.isHovered) {
                return true; // Signal to restart game
            }
        }
        return false;
    }

    draw(score, wave, time, playerData, topScores, playerRank = null) {
        // Priority 5: Input validation and try-catch for robustness
        try {
            // Validate inputs
            if (typeof score !== 'number' || isNaN(score)) {
                console.error('Invalid score:', score);
                score = 0;
            }
            if (typeof wave !== 'number' || isNaN(wave)) {
                console.error('Invalid wave:', wave);
                wave = 0;
            }
            if (typeof time !== 'number' || isNaN(time)) {
                console.error('Invalid time:', time);
                time = 0;
            }
            if (!playerData || typeof playerData !== 'object') {
                console.error('Invalid playerData:', playerData);
                playerData = { nick: 'Unknown', email: '' };
            }
            if (!Array.isArray(topScores)) {
                console.error('Invalid topScores:', topScores);
                topScores = [];
            }

            const vw = getVirtualWidth();
            const vh = getVirtualHeight();
            const centerX = vw / 2;

            // Check if player is in top 4
            const isInTop4 = playerRank && playerRank.rank <= 4;

        // Gray space/cosmic background (semi-transparent to show stars)
        push();

        // Gray background with slight texture - reduced alpha for transparency
        fill(30, 30, 35, 180); // 180/255 = ~70% opacity (było 250)
        noStroke();
        rect(0, 0, vw, vh);

        // Darker vignette from edges
        for (let i = 0; i < 8; i++) {
            const alpha = 20 - i * 2;
            const offset = i * 40;
            stroke(10, 10, 15, alpha);
            strokeWeight(offset);
            noFill();
            rect(-offset, -offset, vw + offset * 2, vh + offset * 2);
        }

        pop();

        // --- WASTED TEXT ---
        push();
        // Use pixel font if available, otherwise fallback to Russo One
        if (this.pixelFont) {
            textFont(this.pixelFont);
        } else {
            textFont('Russo One, Impact, sans-serif');
        }
        textAlign(CENTER, CENTER);

        const wastedY = 120; // Lowered the text a bit
        const wastedSize = (this.isMobile ? 100 : 90) * this.wastedScale;
        textSize(wastedSize);
        textStyle(BOLD);

        const letters = ['W', 'A', 'S', 'T', 'E', 'D'];
        const letterSpacing = wastedSize * 0.8; // Zwiększone odstępy między literami
        const totalTextWidth = letters.length * letterSpacing;
        let startX = centerX - totalTextWidth / 2;

        // Apply shake if active
        let shakeX = 0;
        let shakeY = 0;
        if (this.shakeTime > 0) {
            shakeX = (random() - 0.5) * this.shakeIntensity;
            shakeY = (random() - 0.5) * this.shakeIntensity;
        }

        letters.forEach((char, index) => {
            const charX = startX + index * letterSpacing + (letterSpacing / 2);
            let charY = wastedY;
            let rotation = 0;

            if (char === 'W') {
                rotation = -0.1; // Tilt left
                charY += 10;    // Move down
            } else if (char === 'D') {
                rotation = 0.1; // Tilt right
                charY -= 10;    // Move up
            }

            push();
            translate(charX + shakeX, charY + shakeY);
            rotate(rotation);

            // Draw outline
            strokeWeight(12);
            stroke(0, 0, 0, this.wastedAlpha);
            fill(0, 0, 0, 0);
            text(char, 0, 0);

            // Draw fill
            noStroke();
            fill(190, 0, 0, this.wastedAlpha);
            text(char, 0, 0);
            pop();
        });

        pop();

        // Player info with nick - right under WASTED
        const statsY = wastedY + 90; // Adjusted Y position

        // Format time
        const totalSeconds = Math.floor(time);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const timeString = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;

        // Player name and stats - GTA style
        push();
        textAlign(CENTER, CENTER);
        textFont('Rajdhani, Arial, sans-serif');

        // Player name in gold/yellow
        textSize(24);
        fill(255, 215, 100);
        textStyle(BOLD);
        text(playerData.nick, centerX, statsY);

        // Stats below
        textSize(18);
        fill(200, 200, 200);
        textStyle(NORMAL);

        const statsSpacing = 28;
        text('Score: ' + this.formatScore(score) + ' • Wave: ' + wave + ' • Time: ' + timeString,
             centerX, statsY + statsSpacing + 5);

        pop();

        // Congratulations message if player is in top 4
        let congratsOffset = 0;
        if (isInTop4) {
            push();
            textAlign(CENTER, CENTER);
            textFont('Orbitron, Arial, sans-serif');
            textStyle(BOLD);
            textSize(20);

            // Pulsing gold effect
            const pulse = sin(millis() * 0.003) * 0.15 + 0.85; // Pulsuje między 0.7 a 1.0
            fill(255, 215, 0, pulse * 255);

            // Rank text with medal emoji
            let rankText = '';
            if (playerRank.rank === 1) rankText = '🏆 CONGRATULATIONS! YOU\'RE #1! 🏆';
            else if (playerRank.rank === 2) rankText = '🥈 GREAT JOB! YOU\'RE #2! 🥈';
            else if (playerRank.rank === 3) rankText = '🥉 AWESOME! YOU\'RE #3! 🥉';
            else if (playerRank.rank === 4) rankText = '⭐ WELL DONE! YOU\'RE #4! ⭐';

            text(rankText, centerX, statsY + statsSpacing + 35);
            pop();

            // Reduce spacing on small screens to prevent overlap
            congratsOffset = this.isSmallScreen ? 15 : 30;
        }

        // Top Scores Section - GTA style
        const leaderboardY = statsY + 80 + congratsOffset;

        push();
        textAlign(CENTER, CENTER);
        textSize(20);
        textStyle(BOLD);
        textFont('Orbitron, Arial, sans-serif');
        fill(200, 200, 200);
        text('TOP 4 RANKINGS', centerX, leaderboardY);

        // Simple line separator
        stroke(80, 80, 80);
        strokeWeight(1);
        line(centerX - 210, leaderboardY + 15, centerX + 210, leaderboardY + 15);
        pop();

        // Leaderboard table - simpler GTA style
        const tableY = leaderboardY + 35;
        const rowHeight = 30;

        push();

        // Table header
        textSize(12);
        textFont('Rajdhani, Arial, sans-serif');
        fill(120, 120, 120);
        textStyle(BOLD);

        // Centered column positions (FAB button no longer interferes)
        const col1 = centerX - 200;
        const col2 = centerX - 80;
        const col3 = centerX + 40;
        const col4 = centerX + 170;

        textAlign(LEFT, CENTER);
        text('#', col1, tableY);
        textAlign(CENTER, CENTER);
        text('PLAYER', col2, tableY);
        text('SCORE', col3, tableY);
        text('TIME', col4, tableY);

        // Table rows with different sizes and colors for each rank
        textStyle(NORMAL);
        textFont('Rajdhani, Arial, sans-serif');

        for (let i = 0; i < topScores.length; i++) {
            const scoreData = topScores[i];
            const rowY = tableY + (i + 1) * rowHeight;

            // Highlight current player's score
            // NOTE: time is already Math.floor'd before being passed to draw()
            const nickMatch = scoreData.nick === playerData.nick;
            const scoreMatch = Math.abs(scoreData.score - score) < 1;
            const timeMatch = Math.abs(scoreData.time - time) < 1;
            const isCurrentPlayer = nickMatch && scoreMatch && timeMatch;

            if (isCurrentPlayer) {
                // Highlight background with pulsing effect for current player
                const pulse = sin(millis() * 0.004) * 0.3 + 0.7; // Pulsuje między 0.4 a 1.0

                // More visible highlight with golden glow
                fill(80, 60, 0, 150 * pulse); // Dark gold background
                noStroke();
                rect(col1 - 10, rowY - rowHeight/2 + 2, 414, rowHeight - 4, 4);

                // Glowing border
                stroke(255, 215, 0, 180 * pulse);
                strokeWeight(2);
                noFill();
                rect(col1 - 10, rowY - rowHeight/2 + 2, 414, rowHeight - 4, 4);
            }

            // Different colors and sizes for each rank
            let rowColor, rowSize;
            if (i === 0) {
                // 1st place - GOLD, largest
                rowColor = isCurrentPlayer ? color(255, 235, 100) : color(255, 215, 0);
                rowSize = 18;
                textStyle(BOLD);
            } else if (i === 1) {
                // 2nd place - SILVER, medium
                rowColor = isCurrentPlayer ? color(240, 240, 240) : color(192, 192, 192);
                rowSize = 16;
                textStyle(BOLD);
            } else if (i === 2) {
                // 3rd place - BRONZE, smaller
                rowColor = isCurrentPlayer ? color(255, 200, 120) : color(205, 127, 50);
                rowSize = 14;
                textStyle(NORMAL);
            } else {
                // 4th+ place - GRAY, smallest
                rowColor = isCurrentPlayer ? color(220, 220, 220) : color(150, 150, 150);
                rowSize = 14;
                textStyle(NORMAL);
            }

            fill(rowColor);
            textSize(rowSize);

            // Position
            textAlign(LEFT, CENTER);
            text((i + 1).toString(), col1, rowY);

            // Nick (truncate if too long)
            const nickDisplay = scoreData.nick.length > 12 ?
                                scoreData.nick.substring(0, 12) + '...' :
                                scoreData.nick;
            textAlign(CENTER, CENTER);
            text(nickDisplay, col2, rowY);

            // Score
            textAlign(CENTER, CENTER);
            text(this.formatScore(scoreData.score), col3, rowY);

            // Time
            const mins = Math.floor(scoreData.time / 60);
            const secs = scoreData.time % 60;
            const timeStr = mins + ':' + (secs < 10 ? '0' : '') + secs;
            textAlign(CENTER, CENTER);
            text(timeStr, col4, rowY);
        }

        // If less than 4 scores, show empty slots
        textStyle(NORMAL);
        textSize(14);
        fill(80, 80, 80);
        for (let i = topScores.length; i < 4; i++) {
            const rowY = tableY + (i + 1) * rowHeight;
            textAlign(LEFT, CENTER);
            text((i + 1).toString(), col1, rowY);
            textAlign(CENTER, CENTER);
            text('---', col2, rowY);
            text('---', col3, rowY);
            text('---', col4, rowY);
        }

        // Show player's rank if outside top 4
        if (playerRank && playerRank.rank > 4) {
            const rowY = tableY + 5 * rowHeight;

            // Separator line
            stroke(100, 100, 100);
            strokeWeight(1);
            line(col1 - 8, rowY - rowHeight/2 + 3, col4 + 30, rowY - rowHeight/2 + 3);

            // Highlight background for player's score (below the separator line)
            fill(60, 0, 0, 100);
            noStroke();
            rect(col1 - 8, rowY - rowHeight/2 + 6, 410, rowHeight - 6, 3);

            // Player's actual rank
            fill(255, 220, 100); // Gold for current player
            textSize(14);
            textStyle(BOLD);
            textAlign(LEFT, CENTER);
            text(playerRank.rank.toString() + '.', col1, rowY);

            // Nick
            const nickDisplay = playerRank.data.nick.length > 12 ?
                                playerRank.data.nick.substring(0, 12) + '...' :
                                playerRank.data.nick;
            textAlign(CENTER, CENTER);
            text(nickDisplay, col2, rowY);

            // Score
            textAlign(CENTER, CENTER);
            text(this.formatScore(playerRank.data.score), col3, rowY);

            // Time
            const mins = Math.floor(playerRank.data.time / 60);
            const secs = playerRank.data.time % 60;
            const timeStr = mins + ':' + (secs < 10 ? '0' : '') + secs;
            textAlign(CENTER, CENTER);
            text(timeStr, col4, rowY);

            textStyle(NORMAL);
        }

        pop();

        // FAB button with heart icon and animations
        push();

        // Calculate heartbeat animation (double pulse)
        const t = (millis() * 0.004) % (2 * Math.PI);
        const beat1 = Math.max(0, Math.sin(t * 2));
        const beat2 = Math.max(0, Math.sin(t * 2 - 0.3));
        const heartbeatPulse = 1 + (beat1 + beat2) * 0.08;

        // Calculate glow pulse
        const glowPulse = Math.sin(millis() * 0.003) * 0.1 + 1.0;

        // Hover scale effect
        const hoverScale = this.fabButton.isHovered ? 1.15 : 1.0;
        const finalScale = hoverScale * heartbeatPulse;

        // Draw glow effect
        if (this.fabButton.isHovered) {
            noFill();
            stroke(255, 100, 100, 100 * glowPulse);
            strokeWeight(6);
            circle(this.fabButton.x, this.fabButton.y, this.fabButton.radius * 2 * finalScale + 20);
        }

        // Draw circular background
        if (this.fabButton.isHovered) {
            fill(60, 60, 60);
            stroke(255, 120, 120);
            strokeWeight(4);
        } else {
            fill(40, 40, 40);
            stroke(255, 100, 100);
            strokeWeight(3);
        }
        circle(this.fabButton.x, this.fabButton.y, this.fabButton.radius * 2 * finalScale);

        // Draw heart icon
        imageMode(CENTER);
        tint(255, 100, 100); // Red tint for heart
        image(
            this.game.heartImg,
            this.fabButton.x,
            this.fabButton.y,
            this.fabButton.radius * 1.3 * finalScale,
            this.fabButton.radius * 1.3 * finalScale
        );
        noTint();

        pop();

        // Message button with envelope icon (swinging animation)
        push();

        // Calculate swing animation (bujanie na boki)
        const swingAngle = Math.sin(millis() * 0.003) * 0.15; // ±0.15 radians (~8.6 degrees)

        // Calculate glow pulse (same as heart)
        const glowPulseMsg = Math.sin(millis() * 0.003) * 0.1 + 1.0;

        // Hover scale effect (no heartbeat pulse for message button)
        const hoverScaleMsg = this.messageButton.isHovered ? 1.15 : 1.0;

        // Draw glow effect
        if (this.messageButton.isHovered) {
            noFill();
            stroke(100, 150, 255, 100 * glowPulseMsg); // Blue glow for message
            strokeWeight(6);
            circle(this.messageButton.x, this.messageButton.y, this.messageButton.radius * 2 * hoverScaleMsg + 20);
        }

        // Draw circular background
        if (this.messageButton.isHovered) {
            fill(60, 60, 60);
            stroke(120, 170, 255); // Blue border for message
            strokeWeight(4);
        } else {
            fill(40, 40, 40);
            stroke(100, 150, 255); // Blue border for message
            strokeWeight(3);
        }
        circle(this.messageButton.x, this.messageButton.y, this.messageButton.radius * 2 * hoverScaleMsg);

        // Draw envelope emoji with swing animation
        translate(this.messageButton.x, this.messageButton.y);
        rotate(swingAngle); // Apply swing rotation

        textAlign(CENTER, CENTER);
        textSize(this.messageButton.radius * 1.2 * hoverScaleMsg); // Emoji size
        text('💌', 0, 0); // Envelope emoji

        pop();

        // Label under message button
        push();
        textAlign(CENTER, CENTER);
        textFont('Rajdhani, Arial, sans-serif');
        textSize(28); // 2× większa czcionka (było 14)
        fill(180, 180, 180);
        textStyle(NORMAL);

        // Two lines of text
        text('Zostaw', this.messageButton.x, this.messageButton.y + this.messageButton.radius + 20);
        text('Wiadomość', this.messageButton.x, this.messageButton.y + this.messageButton.radius + 48); // Zwiększony odstęp dla większej czcionki

        pop();

        } catch (error) {
            console.error('❌ Error rendering game over screen:', error);

            // Fallback rendering
            push();
            background(30, 30, 35);
            fill(255, 0, 0);
            textAlign(CENTER, CENTER);
            textSize(36);
            text('GAME OVER', getVirtualWidth() / 2, getVirtualHeight() / 2 - 50);

            fill(255);
            textSize(24);
            text(`Score: ${score}`, getVirtualWidth() / 2, getVirtualHeight() / 2);
            text(`Wave: ${wave}`, getVirtualWidth() / 2, getVirtualHeight() / 2 + 40);

            // Show restart button
            fill(100, 200, 100);
            textSize(20);
            text('Click to Restart', getVirtualWidth() / 2, getVirtualHeight() / 2 + 100);
            pop();
        }
    }

    handleMessageClick() {
        // Show prompt to user
        const message = window.prompt("Zostaw wiadomość (max 200 znaków):");

        // Validate and send
        if (message && message.trim().length > 0) {
            const trimmedMessage = message.trim().substring(0, 200);
            console.log('📧 Wysyłanie wiadomości:', trimmedMessage);
            this.sendMessageToSheets(trimmedMessage);
        }
    }

    async sendMessageToSheets(message) {
        // Import sendStatsToGoogleSheets dynamically to avoid circular dependencies
        const { sendStatsToGoogleSheets } = await import('../utils/analytics.js');

        // Get current game stats from game object
        const stats = {
            finalScore: this.game.score || 0,
            finalWave: this.game.wave || 0,
            enemiesKilled: this.game.enemiesKilled || 0,
            totalGameTime: this.game.gameTime?.toFixed(2) || '0',
            totalShots: this.game.totalShots || 0,
            shotsPerSecond: this.game.gameTime > 0 ? (this.game.totalShots / this.game.gameTime).toFixed(2) : '0',
            shotsByWeapon: this.game.shotsByWeapon || { basic: 0, triple: 0, rocket: 0 },
            powerUpsCollected: this.game.powerUpsCollected || { life: 0, shield: 0, autofire: 0, tripleshot: 0, rocket: 0 }
        };

        // Get FPS stats if available
        const fpsStats = this.game.performanceMonitor?.getFpsStats() || null;

        // Get player data
        const playerData = this.game.playerData || { nick: 'Anonymous', email: '' };

        try {
            // Send to Google Sheets with message as fingerprint override
            // We'll need to modify the call to accept a fingerprint override parameter
            // For now, we'll use a workaround by temporarily modifying the fingerprint

            // Call sendStatsToGoogleSheets with custom fingerprint parameter
            // Note: We'll need to pass the message as a custom parameter
            const result = await sendStatsToGoogleSheets(playerData, stats, fpsStats, message);

            if (result) {
                console.log('✅ Wiadomość wysłana pomyślnie!');
                window.alert('✅ Dziękujemy za wiadomość!');
            } else {
                console.error('❌ Nie udało się wysłać wiadomości');
                window.alert('❌ Nie udało się wysłać wiadomości. Spróbuj ponownie.');
            }
        } catch (error) {
            console.error('❌ Błąd podczas wysyłania wiadomości:', error);
            window.alert('❌ Wystąpił błąd. Spróbuj ponownie.');
        }
    }
}