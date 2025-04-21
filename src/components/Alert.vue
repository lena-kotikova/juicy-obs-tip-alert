<template>
    <div class="alert-container">
        <div v-if="currentTip" class="alert-box" :class="{ 'fade-out': isFading }">
            <div class="alert-header">
                <span class="alert-icon">💰</span>
                <span class="alert-title">{{ currentTip.message }}</span>
            </div>
            <div class="alert-content">
                <img src="../assets/tip.gif" alt="juicy" class="alert-image">
            </div>
        </div>
        <audio ref="alertAudio" src="../assets/alert.mp3" preload="auto"></audio>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const API_URL = `/juicy-api/api/stream_comments?sessionId=${import.meta.env.VITE_SESSION_ID}`
const POLL_INTERVAL = 5000 // 5 seconds
const DISPLAY_DURATION = 5000 // 5 seconds
const MAX_HISTORY_SIZE = 100 // Maximum number of tips to keep in history

// State management
const tipQueue = ref([])
const tipHistory = ref(new Set())
const currentTip = ref(null)
const isFading = ref(false)
const alertAudio = ref(null)
const lastFetchData = ref(null) // Store last fetch response
const hasUserInteracted = ref(false)
let pollInterval = null
let displayTimeout = null

const playAlertSound = () => {
    if (alertAudio.value && hasUserInteracted.value) {
        alertAudio.value.currentTime = 0
        alertAudio.value.play().catch(error => {
            console.error('Error playing alert sound:', error)
        })
    }
}

const processNewTips = (newData) => {
    if (!newData?.data) {
        console.log('No data in response')
        return []
    }

    console.log('Processing new data:', newData.data)

    // If this is the first fetch, just return all system messages
    if (!lastFetchData.value) {
        console.log('First fetch, processing all system messages')
        const firstTips = newData.data
            .filter(msg => msg.messageType === 'system')
            .map(msg => ({
                id: msg._id,
                message: msg.message
            }))
        console.log('First tips:', firstTips)
        return firstTips
    }

    // Find new tips by comparing with last fetch
    const newTips = newData.data
        .filter(newMsg => {
            // Only process system messages
            if (newMsg.messageType !== 'system') { return false }
            
            // Check if message is not in history
            if (tipHistory.value.has(newMsg._id)) { return false }
            
            // Check if message is newer than any in last fetch
            const isNew = !lastFetchData.value.data.some(
                oldMsg => oldMsg._id === newMsg._id
            )
            
            if (isNew) {
                console.log('New tip found:', newMsg)
            } else {
                console.log('Tip already in last fetch:', newMsg._id)
            }
            
            return isNew
        })
        .map(msg => ({
            id: msg._id,
            message: msg.message
        }))

    console.log('Processed new tips:', newTips)
    return newTips
}

const fetchMessages = async () => {
    try {
        console.log('Fetching messages')
        const response = await fetch(API_URL)
        const data = await response.json()
        
        if (data.success) {
            console.log('Fetch successful')
            // Process new tips
            const newTips = processNewTips(data)
            
            if (newTips.length > 0) {
                console.log('Adding new tips to queue:', newTips)
                // Add new tips to queue
                tipQueue.value.push(...newTips);
            } else {
                console.log('No new tips found')
            }

            // If no tip is currently being displayed, show the next one
            if (!currentTip.value) {
                console.log('No tip currently displayed, showing next tip')
                showNextTip()
            } else {
                console.log('Tip already displaying, tips queued:', tipQueue.value.length)
            }
            
            // Update last fetch data
            lastFetchData.value = data
        } else {
            console.log('Fetch not successful:', data)
        }
    } catch (error) {
        console.error('Error fetching messages:', error)
    }
}

const showNextTip = () => {
    if (tipQueue.value.length > 0) {
        console.log('Showing next tip')
        console.log('Current queue:', tipQueue.value)
        
        // Clear any existing timeout
        if (displayTimeout) {
            clearTimeout(displayTimeout)
            displayTimeout = null
        }
        
        const nextTip = tipQueue.value.shift()
        console.log('Next tip to show:', nextTip)
        
        // Double check if tip hasn't been shown (race condition protection)
        if (tipHistory.value.has(nextTip.id)) {
            console.log('Tip already shown, skipping:', nextTip)
            showNextTip() // Try next tip
            return
        }
        
        currentTip.value = nextTip
        isFading.value = false
        
        // Add to history
        tipHistory.value.add(nextTip.id)
        console.log('Added tip to history:', nextTip.id)
        
        // Clean up old history if needed
        if (tipHistory.value.size > MAX_HISTORY_SIZE) {
            const historyArray = Array.from(tipHistory.value)
            tipHistory.value = new Set(historyArray.slice(-MAX_HISTORY_SIZE))
        }
        
        playAlertSound()
        
        // Start fade out animation before removing the tip
        displayTimeout = setTimeout(() => {
            isFading.value = true
            setTimeout(() => {
                currentTip.value = null
                isFading.value = false
                console.log('Tip display completed')
                // Show next tip if available
                if (tipQueue.value.length > 0) {
                    console.log('More tips in queue, showing next')
                    showNextTip()
                } else {
                    console.log('No more tips in queue')
                }
            }, 500) // Fade out animation duration
        }, DISPLAY_DURATION)
    } else {
        console.log('No tips in queue to show')
    }
}

// Add event listener for user interaction
onMounted(() => {
    console.log('Component mounted')
    // Start polling
    pollInterval = setInterval(fetchMessages, POLL_INTERVAL)
    // Initial fetch
    fetchMessages()

    // Listen for any user interaction
    const handleUserInteraction = () => {
        hasUserInteracted.value = true
        // Remove the event listener after first interaction
        document.removeEventListener('click', handleUserInteraction)
        document.removeEventListener('keydown', handleUserInteraction)
        document.removeEventListener('touchstart', handleUserInteraction)
    }

    // Add event listeners for different types of user interaction
    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('keydown', handleUserInteraction)
    document.addEventListener('touchstart', handleUserInteraction)
})

onUnmounted(() => {
    console.log('Component unmounted')
    if (pollInterval) clearInterval(pollInterval)
    if (displayTimeout) clearTimeout(displayTimeout)
})
</script>

<style scoped>
.alert-container {
    position: absolute;
    z-index: 1000;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent;
}

.alert-box {
    background: rgba(0, 0, 0, 1);
    border-radius: 12px;
    padding: 20px;
    color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 2px solid #84cc15;
    animation: slideIn 0.5s ease-out;
    width: 500px;
    text-align: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.alert-box.fade-out {
    animation: slideOut 0.5s ease-in forwards;
}

.alert-header {
    display: flex;
    text-align: center;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
}

.alert-icon {
    font-size: 24px;
}

.alert-title {
    font-size: 18px;
    font-weight: bold;
    color: #84cc15;
}

.alert-content {
    text-align: center;
}

.alert-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
}

@keyframes slideIn {
    from {
        transform: translate(-50%, -100vh);
        opacity: 0;
    }
    to {
        transform: translate(-50%, -50%);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translate(-50%, -50%);
        opacity: 1;
    }
    to {
        transform: translate(-50%, 100vh);
        opacity: 0;
    }
}
</style> 