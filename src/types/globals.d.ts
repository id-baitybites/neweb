// Global type declarations for third-party browser globals

interface Window {
    snap: {
        pay: (token: string, options: {
            onSuccess?: (result: any) => void;
            onPending?: (result: any) => void;
            onError?: (result: any) => void;
            onClose?: () => void;
        }) => void;
    };
}
