import axios from 'axios';

const webhook = (message, webhookUrl) => {
    axios.post(webhookUrl, {
        content: message
    })
        .catch(error => {
            console.error('Error sending message to Discord:', error);
        });

};

const sanitize = (message) => {
    return message.replace(/`/g, '` ');
};

export { webhook, sanitize };