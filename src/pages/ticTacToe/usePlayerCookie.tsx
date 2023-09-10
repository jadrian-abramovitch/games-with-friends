const UsePlayerCookie = () => {
const playerCookieExists = () => {
    if (typeof window !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i]?.includes('ticTacToe')) {
                return cookies[i];
            }
        }
    }
    return false;
};
const setCookie = (name: string, value: string, days?: number): void => {
    if (typeof window !== 'undefined') {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie =
            'ticTacToe' + name + '=' + value + expires + '; path=/';
    }
};
const randomNumberString = Math.random().toString();
    let currentPlayerCookie = playerCookieExists();
    if (!currentPlayerCookie) {
        setCookie(randomNumberString, '', 2);
    }
    currentPlayerCookie = playerCookieExists();
    console.log('how many times is this invoked?');
    // if (!currentPlayerCookie) throw new Error('Cookie Could not be set');
    return(currentPlayerCookie);
}

export default UsePlayerCookie;
