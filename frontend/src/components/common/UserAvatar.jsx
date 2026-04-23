import { cn, getInitials } from '@/lib/utils';

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

export default function UserAvatar({ user, size = 'md', className }) {
  if (!user) return null;
  return (
    <div className={cn('rounded-full overflow-hidden flex-shrink-0 brand-gradient flex items-center justify-center font-semibold text-white', sizeMap[size], className)}>
      {user.avatar
        ? <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
        : <span>{getInitials(user.firstName, user.lastName)}</span>
      }
    </div>
  );
}
