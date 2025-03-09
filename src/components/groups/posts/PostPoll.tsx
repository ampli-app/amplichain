
interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PostPollProps {
  options: PollOption[];
  userVoted?: string;
  postId: string;
  groupId?: string;
}

export function PostPoll({ options, userVoted, postId, groupId }: PostPollProps) {
  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);
  
  return (
    <div className="mt-4 space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-md mb-4">
      {options.map((option) => {
        const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
        const isVoted = userVoted === option.id;
        
        return (
          <div key={option.id} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">{option.text}</span>
              <span>{percentage}%</span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${isVoted ? 'bg-primary' : 'bg-slate-400 dark:bg-slate-500'} rounded-full`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {option.votes} {option.votes === 1 ? 'głos' : 
                option.votes % 10 >= 2 && option.votes % 10 <= 4 && 
                (option.votes % 100 < 10 || option.votes % 100 > 20) ? 
                'głosy' : 'głosów'}
            </div>
          </div>
        );
      })}
      <div className="text-sm text-muted-foreground mt-2">
        Łącznie: {totalVotes} {totalVotes === 1 ? 'głos' : 
          totalVotes % 10 >= 2 && totalVotes % 10 <= 4 && 
          (totalVotes % 100 < 10 || totalVotes % 100 > 20) ? 
          'głosy' : 'głosów'}
      </div>
    </div>
  );
}
