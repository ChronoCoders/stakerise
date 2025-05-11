import { toast } from 'sonner';

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (error: any) => {
  const message = error?.message || 'An error occurred';
  toast.error(message);
};

export const showWarning = (message: string) => {
  toast.warning(message);
};

export const showInfo = (message: string) => {
  toast.info(message);
};

export const showTransaction = (hash: string) => {
  toast.success(
    <div className="flex flex-col gap-2">
      <p>Transaction submitted</p>
      <a
        href={`https://etherscan.io/tx/${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary hover:underline"
      >
        View on Etherscan
      </a>
    </div>
  );
};