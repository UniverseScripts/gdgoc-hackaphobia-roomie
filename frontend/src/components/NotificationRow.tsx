import { Switch } from '@/components/ui/switch';

interface NotificationRowProps {
  label: string;
  desc: string;
  defaultChecked?: boolean;
}

export function NotificationRow({ label, desc, defaultChecked = false }: NotificationRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        <div className="text-xs text-gray-500">{desc}</div>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}