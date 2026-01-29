import { useRef, useState } from 'react';

function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState('idle');
    const [isResetting, setIsResetting] = useState(false);
    const wipeTimerRef = useRef(null);
    const wipeMetaRef = useRef({
        start: 0,
        duration: 900,
        name: '',
        email: '',
        message: ''
    });

    const clearWipeTimer = () => {
        if (wipeTimerRef.current) {
            clearInterval(wipeTimerRef.current);
            wipeTimerRef.current = null;
        }
    };

    const startWipeReset = () => {
        setIsResetting(true);
        clearWipeTimer();
        wipeMetaRef.current = {
            start: Date.now(),
            duration: 2000,
            name: formData.name,
            email: formData.email,
            message: formData.message,
        };

        wipeTimerRef.current = setInterval(() => {
            const { start, duration, name, email, message } = wipeMetaRef.current;
            const progress = Math.min(1, (Date.now() - start) / duration);

            const next = {
                name: name.slice(0, Math.max(0, Math.ceil(name.length * (1 - progress)))),
                email: email.slice(0, Math.max(0, Math.ceil(email.length * (1 - progress)))),
                message: message.slice(0, Math.max(0, Math.ceil(message.length * (1 - progress)))),
            };

            setFormData(next);

            if (progress >= 1) {
                clearWipeTimer();
                setIsResetting(false);
                setStatus('idle');
            }
        }, 30);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Please enter a valid email address.');
            return;
        }

        if (!formData.name || !formData.email || !formData.message) {
            alert('Please fill in all fields.');
            return;
        }
        if (formData.message.length > 2000) {
            alert('Message must be 2000 characters or less.');
            return;
        }

        setStatus('sending');

        const formDataToSend = new FormData();
        formDataToSend.append("access_key", "44ccf1a9-3663-48fe-8f29-eedb3977ae3e");
        formDataToSend.append("name", formData.name);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("message", formData.message);

        const object = Object.fromEntries(formDataToSend);
        const json = JSON.stringify(object);

        try {
            const res = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: json
            }).then((res) => res.json());

            if (res.success) {
                setStatus('success');
                startWipeReset();
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setStatus('error');
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        const nextValue = name === 'message' ? value.slice(0, 2000) : value;
        setFormData({ ...formData, [name]: nextValue });
    };

    return (
        <div className="contact-form-container">
            <form 
                onSubmit={handleSubmit} 
                className={`font-metropolis contact-form contact-form-modern ${status === 'sending' || isResetting ? 'contact-form--blocked' : ''} ${isResetting ? 'contact-form--resetting' : ''}`}
            >
                <div className="contact-form-grid">
                    <label className="contact-field">
                        <span>Name</span>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your name"
                            required
                            disabled={status === 'sending' || isResetting}
                        />
                    </label>
                    <label className="contact-field">
                        <span>Email</span>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@email.com"
                            required
                            disabled={status === 'sending' || isResetting}
                        />
                    </label>
                </div>
                <label className="contact-field contact-field--full">
                    <span>Message</span>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="I'm interested in..."
                        required
                        disabled={status === 'sending' || isResetting}
                        maxLength={2000}
                    />
                </label>
                <div className="contact-actions">
                    <button type="submit" disabled={status === 'sending' || isResetting}>
                        {status === 'sending' ? 'Sending...' : 'Send message'}
                    </button>
                    {formData.message.length >= 2000 && (
                        <span className="contact-limit">Character limit reached</span>
                    )}
                </div>
                {status === 'error' && (
                    <p className="contact-error">Couldn’t send. Try again.</p>
                )}
            </form>
            <div className={`contact-toast ${status === 'success' ? 'is-visible' : ''}`}>
                Message sent
            </div>
        </div>
    );
}

export default ContactForm; 