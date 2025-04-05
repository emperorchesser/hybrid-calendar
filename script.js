document.addEventListener('DOMContentLoaded', () => {
    const prevButton = document.getElementById('prevmonth');
    const nextButton = document.getElementById('nextmonth');
    const monthSpan = document.getElementById('month');
    const yearSpan = document.getElementById('year');
    const dates = document.querySelector('.dates');
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('current-date');
    const hourHand = document.getElementById('hr');
    const minuteHand = document.getElementById('min');
    const secondHand = document.getElementById('sec');
    const tzName = document.getElementById('tz-name');
    const location = document.getElementById('location');
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    const status = document.getElementById('status');

    const darkModeSwitch = document.getElementById('switch-mode');
    const body = document.body;
    const affectedElements = document.querySelectorAll('#analog-clock, input');
    const refreshInterval = 15;

    const enableDarkMode = () => {
        body.classList.add('dark-mode');
        affectedElements.forEach((e) => e.classList.add('dark-mode'));
        localStorage.setItem('darkMode', 'enabled');
    };
    const disableDarkMode = () => {
        body.classList.remove('dark-mode');
        affectedElements.forEach((e) => e.classList.remove('dark-mode'));
        localStorage.setItem('darkMode', 'disabled');
    };

    if (localStorage.getItem('darkMode') === 'enabled') {
        enableDarkMode();
    }
    darkModeSwitch.addEventListener('change', () => {
        if (darkModeSwitch.checked) {
            enableDarkMode();
        } else {
            disableDarkMode();
        }
    });

    const cityName = 'Honolulu, Hawaii, United States';
    const tzString = 'Pacific/Honolulu';
    const standardName = 'HST';
    const daylightName = 'HST';
    const standardtz = "'UTC-10:00'";
    const daylighttz = "'UTC-10:00'";
    let currentDate = new Date(new Date().toLocaleString('en-US', { timeZone: tzString }));
    let modifiedDate = new Date(currentDate.getFullYear(), currentDate.getMonth());

    const render = (date = new Date()) => {
        dates.innerHTML = '';
        let year = date.getFullYear();
        let month = date.getMonth();

        monthSpan.textContent = months[month];
        yearSpan.textContent = formatYear(year);

        let firstDay = new Date(year, month, 1).getDay();
        let lastDate = new Date(year, month + 1, 0).getDate();
        let totalGrids = firstDay + lastDate;
        let currentDay = 1;
        let overflow = 0;

        if (totalGrids > 35) {
            overflow = totalGrids - 35;
        }

        for (let i = 0; i < 7; i++) {
            const dateDiv = document.createElement('div');

            if (i < firstDay) {
                dateDiv.textContent = overflow > 0 ? lastDate - (overflow - 1) : '';
                overflow--;
            } else if (currentDay <= lastDate) {
                dateDiv.textContent = currentDay++;
            } else {
                dateDiv.textContent = '';
            }
            dates.appendChild(dateDiv);
        }
        while (currentDay <= lastDate) {
            const dateDiv = document.createElement('div');
            dateDiv.textContent = currentDay++;
            dates.appendChild(dateDiv);
        }
        while (dates.children.length > 35) {
            dates.removeChild(dates.lastChild);
        }
        if (firstDay === 0 && dates.children.length === 28) {
            dates.appendChild(document.createElement('div'));
        }
    };

    const toISO8601Format = (date = new Date(0), tz = 'Etc/UTC') => {
        date = new Date(date.toISOString());
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            year: 'numeric',
            month: 'numeric',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            fractionalSecondDigits: 3,
        });
        const parts = formatter.formatToParts(date);

        const year = parts.find((p) => p.type === 'year').value.padStart(4, '0');
        const month = parts.find((p) => p.type === 'month').value.padStart(2, '0');
        const day = parts.find((p) => p.type === 'day').value.padStart(2, '0');
        const hour = parts.find((p) => p.type === 'hour').value.padStart(2, '0');
        const minute = parts.find((p) => p.type === 'minute').value.padStart(2, '0');
        const second = parts.find((p) => p.type === 'second').value.padStart(2, '0');
        const millisecond = date.getMilliseconds().toString().padStart(3, '0');

        const utcDate = new Date(date.toUTCString());
        const localDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
        const offsetMinutes = (localDate - utcDate) / 60000;

        const offsetSign = offsetMinutes >= 0 ? '+' : '-';
        const absoluteOffsetMinutes = Math.abs(offsetMinutes);
        const offsetHours = Math.floor(absoluteOffsetMinutes / 60)
            .toString()
            .padStart(2, '0');
        const offsetMinutesPart = (absoluteOffsetMinutes % 60).toString().padStart(2, '0');

        return `${year}-${month}-${day}T${hour}:${minute}:${second}.${millisecond}${offsetSign}${offsetHours}${offsetMinutesPart}`;
    };

    function updateDigit(digitId, newValue) {
        const digitElement = document.getElementById(digitId);
        if (!digitElement) return;

        if (digitElement.textContent !== newValue) {
            digitElement.textContent = newValue;

            // Remove .pop if present
            digitElement.classList.remove('pop');


            // Re-add .pop to trigger the transition
            digitElement.classList.add('pop');

            // OPTIONAL: Remove .pop after the transition so it can be re-triggered later
            setTimeout(() => {
                digitElement.classList.remove('pop');
            }, 85); // match or slightly exceed transition duration
        }
    }

    const updateClock = () => {
        const deg = 6;
        const hrDeg = 30;

        let currentTime = new Date(toISO8601Format(new Date(), tzString).slice(0, 23));
        let milliseconds = currentTime.getMilliseconds() * deg;
        let seconds = currentTime.getSeconds() * deg;
        let minutes = currentTime.getMinutes() * deg;
        let hours = currentTime.getHours() * hrDeg;

        hourHand.style.transform = `rotateZ(${
            hours + minutes / 12 + seconds / 43200 + milliseconds / 43200000
        }deg)`;
        minuteHand.style.transform = `rotateZ(${minutes + seconds / 60 + milliseconds / 60000}deg)`;
        secondHand.style.transform = `rotateZ(${seconds + milliseconds / 1000}deg)`;

        // const getTimeZoneName = (date = new Date(0), startMonth = 1, startWeek = 1, startDayOfWeek = 0, startHour = 0, startMinute = 0, endMonth = 1, endWeek = 1, endDayOfWeek = 0, endHour = 0, endMinute = 0, standard = '', daylight = '') => {
        //     const year = date.getFullYear();
        //     const startDate = getNthDayOfWeek(year, startMonth, startDayOfWeek, startWeek);
        //     const endDate = getNthDayOfWeek(year, endMonth, endDayOfWeek, endWeek);

        //     return date >= new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), startHour, startMinute) && date < new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), endHour, endMinute)  ? daylight : standard;
        // };
        // const getTimeZoneReversedName = (date = new Date(0), startMonth = 1, startWeek = 1, startDayOfWeek = 0, startHour = 0, startMinute = 0, endMonth = 1, endWeek = 1, endDayOfWeek = 0, endHour = 0, endMinute = 0, standard = '', daylight = '') => {
        //     return getTimeZoneName(date, endMonth, endWeek, endDayOfWeek, endHour, endMinute, startMonth, startWeek, startDayOfWeek, startHour, startMinute, standard, daylight) === standard ? daylight : standard;
        // };

        const getCurrentTimeZoneName = (tz = 'Etc/UTC', stdName = '', dstName = '') => {
            const getTimeZoneOffsetInMinutes = (timeZoneString = 'GMT+0:00') => {
                const parts = timeZoneString.match(/GMT([+-])(\d+):(\d+)/);
                if (!parts) {
                    return 0;
                }

                const sign = parts[1] === '+' ? 1 : -1;
                const hours = parseInt(parts[2]);
                const minutes = parseInt(parts[3]);

                return sign * (hours * 60 + minutes);
            };
            const now = new Date();
            const newYearDate = new Date(now.getFullYear(), 0, 1);
            const midYearDate = new Date(now.getFullYear(), 6, 1);

            const formatted = Intl.DateTimeFormat('en-US', {
                timeZone: tz,
                timeZoneName: 'longOffset',
            });
            const newYearName = formatted
                .formatToParts(newYearDate)
                .find((p) => p.type === 'timeZoneName').value;
            const midYearName = formatted
                .formatToParts(midYearDate)
                .find((p) => p.type === 'timeZoneName').value;
            const currentName = formatted
                .formatToParts(now)
                .find((p) => p.type === 'timeZoneName').value;

            const newYearOffset = getTimeZoneOffsetInMinutes(newYearName);
            const midYearOffset = getTimeZoneOffsetInMinutes(midYearName);
            const currentOffset = getTimeZoneOffsetInMinutes(currentName);

            return currentOffset !== Math.min(newYearOffset, midYearOffset) ? dstName : stdName;
        };

        location.innerHTML = cityName;
        let timeString = currentTime
            .toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                fractionalSecondDigits: 2,
                hour12: false,
            })
            .replace(/[:.]/g, '');

        console.log(timeString);
        [0, 1, 2, 3, 4, 5].forEach((value) => {
            updateDigit(`digit${value + 1}`, timeString[value]);
        });
        document.getElementById('hundredths').innerHTML = timeString.slice(6);
        tzName.innerHTML = getCurrentTimeZoneName(tzString, standardName, daylightName);
        // tzName.innerHTML = standardName;
        dateElement.innerHTML = currentTime.toLocaleString('en-US', {
            dateStyle: 'full',
        });
        document.documentElement.style.setProperty(
            '--offset',
            tzName.innerHTML === standardName ? standardtz : daylighttz,
        );

        if (tzName.innerHTML === standardName) {
            status.className = '';
        } else {
            status.className = 'fa-solid fa-sun-bright fa-spin';
        }
    };

    prevButton.addEventListener('click', () => {
        modifiedDate.setMonth(modifiedDate.getMonth() - 1);
        render(modifiedDate);
    });

    nextButton.addEventListener('click', () => {
        modifiedDate.setMonth(modifiedDate.getMonth() + 1);
        render(modifiedDate);
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey) {
            switch (e.key) {
                case 'ArrowLeft':
                    modifiedDate.setFullYear(modifiedDate.getFullYear() - 1);
                    render(modifiedDate);
                    break;
                case 'ArrowRight':
                    modifiedDate.setFullYear(modifiedDate.getFullYear() + 1);
                    render(modifiedDate);
                    break;
                default:
                    break;
            }
        } else {
            switch (e.key) {
                case 'ArrowLeft':
                    modifiedDate.setMonth(modifiedDate.getMonth() - 1);
                    render(modifiedDate);
                    break;
                case 'ArrowRight':
                    modifiedDate.setMonth(modifiedDate.getMonth() + 1);
                    render(modifiedDate);
                    break;
                default:
                    break;
            }
        }
    });

    const formatYear = (year = 2000) => {
        if (year > 0) {
            if (year > 150) {
                return year.toString();
            } else {
                return 'AD ' + year.toString();
            }
        } else {
            return -year + 1 + ' BC';
        }
    };

    render(modifiedDate);
    setInterval(updateClock, refreshInterval);
});
