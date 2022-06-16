import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPause, faPlay, faRotateLeft} from '@fortawesome/free-solid-svg-icons'

const SESSION = 'SESSION';
const BREAK = 'BREAK';

// Define timer initial state
const timerIniState = {
    SESSION: {
        total: 1500,
        durationLeft: 1500,
        isPaused: true
    },
    BREAK: {
        total: 300,
        durationLeft: 300,
        isPaused: true
    }
}

// Import alarm beep audio
const alarm_sound = require('./sounds/alarm_clock.mp3');

const otherTimer = (current) => {
    switch(current) {
        case SESSION:
            return BREAK;
        case BREAK:
            return SESSION
    }
}

export default function Clock() {

    const [timers, setTimers] = useState({SESSION: {...timerIniState.SESSION}, BREAK: {...timerIniState.BREAK}});
    const [currentTimer, setCurrentTimer] = useState(SESSION);
    const [isRunning, setIsRunning] = useState(false);
    const alarm = document.getElementById('beep');

    // Reset timers
    function resetAll() {
        setTimers({SESSION: {...timerIniState.SESSION}, BREAK: {...timerIniState.BREAK}})
        setCurrentTimer(SESSION)
        setIsRunning(false)

        // Reset alarm (beep)
        alarm.pause()
        alarm.currentTime = 0;
    }

    // Increment / decrement timers
    function updateTimer(event) {
        let target = event.target.id.split('-')[0].toUpperCase();   // Determine if target is session or break
        let val = event.target.value;

        if (!isRunning) {

            // Decrement target duration if duration is more than 1 min
            if (val === '-' && timers[target].total > 60) {         
                setTimers(prev => {
                    return {
                        ...prev,
                        [target]: {
                            ...prev[target],
                            total: prev[target].total - 60,
                            durationLeft: prev[target].total - 60,
                        }
                    }
                })

            // Increment target duration if duration is less than 60 mins
            } else if (val === '+' && timers[target].total < 3600) {       
                setTimers(prev => {
                    return {
                        ...prev,
                        [target]: {
                            ...prev[target],
                            total: prev[target].total + 60,
                            durationLeft: prev[target].total + 60
                        }
                    }
                })
            }
        }
    }   

    // Play or pause current timer
    function runTimer() {
        setIsRunning(!isRunning);

        setTimers(prev => {
            return {
                ...prev,
                [currentTimer]: {
                    ...prev[currentTimer],
                    isPaused: !prev[currentTimer].isPaused
                }
            }
        })
    }


    // Countdown timer
    useEffect(() => {
        const interval = setInterval(() => {

            if (timers[currentTimer].durationLeft === 1) {
                // Play alarm sound
                alarm.currentTime = 0;
                alarm.play();
            }

            // If timer reaches 0, start other timer
            if (timers[currentTimer].durationLeft === 0) {

                clearInterval(interval);
                setCurrentTimer(otherTimer(currentTimer));

                setTimers(prev => {
                    return {
                        ...prev,
                        [currentTimer]: {
                            ...prev[currentTimer],
                            isPaused: true,
                            durationLeft: prev[currentTimer].total
                        },
                        [otherTimer(currentTimer)]: {
                            ...prev[otherTimer(currentTimer)],
                            isPaused: false
                        }
                    }
                })
                
            // Else continue counting down current timer
            } else if (!timers[currentTimer].isPaused) {
                setTimers(prev => {
                    return {
                        ...prev,
                        [currentTimer]: {
                            ...prev[currentTimer],
                            durationLeft: prev[currentTimer].durationLeft - 1
                        }
                    }
                })
            }
        }, 1000);
        return () => clearInterval(interval);
    })
    
    return (
        <div id="clock">
            <div id="decorative-top">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <h1 id="main-title">25 + 5 Clock</h1>

            <section id="input-section">
                <div id="session-input">
                    <h3 id="session-label" className="length-label">Session (min)</h3>
                    <div className="input-container">
                        <button className="decrement" id="session-decrement" value="-" onClick={updateTimer}>-</button>
                        <p className="duration" id="session-length">{Math.floor(timers.SESSION.total / 60)}</p>
                        <button className="increment" id="session-increment" value="+" onClick={updateTimer}>+</button>
                    </div>
                </div>

                <div id="break-input">
                    <h3 id="break-label" className="length-label">Break (min)</h3>
                    <div className="input-container">
                        <button className="decrement" id="break-decrement" value="-" onClick={updateTimer}>-</button>
                        <p className="duration" id="break-length">{Math.floor(timers.BREAK.total / 60)}</p>
                        <button className="increment" id="break-increment" value="+" onClick={updateTimer}>+</button>
                    </div>
                </div>
            </section>

            <section id="timer">
                <div id="timer-container">
                    <h3 id="timer-label">{currentTimer}</h3>
                    <audio src={alarm_sound} type="audio/wav" id="beep"></audio>
                    <p id="time-left" style={timers[currentTimer].durationLeft <= 10 ? {'animation': 'blink 1s infinite'} : {'animation': 'none'}}>
                        {(Math.floor(timers[currentTimer].durationLeft / 60)).toLocaleString('en-US', {minimumIntegerDigits: 2})}:{
                        (timers[currentTimer].durationLeft % 60).toLocaleString('en-US', {minimumIntegerDigits: 2})}</p>
                    <div id="timer-ctrl">
                        <button onClick={runTimer} id="start_stop"><FontAwesomeIcon icon={isRunning ? faPause : faPlay} /></button>
                        <button id="reset" onClick={resetAll}><FontAwesomeIcon icon={faRotateLeft} /></button>
                    </div>
                </div>
            </section>
        </div>
    )
}
