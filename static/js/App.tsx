useEffect(() => {
    if (isGameWon) {
        const winMessage = WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)];
        const delayMs = REVEAL_TIME_MS * solution.length;

        showSuccessAlert(winMessage, {
            delayMs,
            onClose: () => {
                // Call the addScore function from main.js
                if (window.addScore) {
                    window.addScore(10); // Adds 10 points to score
                } else {
                    console.error('addScore function not found!');
                }
            },
        });
    }

    if (isGameLost) {
        showErrorAlert(CORRECT_WORD_MESSAGE(solution), {
            persist: true,
            delayMs: REVEAL_TIME_MS * solution.length + 1,
        });
    }
}, [isGameWon, isGameLost]);
