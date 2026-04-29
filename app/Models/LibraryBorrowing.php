<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LibraryBorrowing extends Model
{
    use HasFactory;

    protected $fillable = ['book_id', 'user_id', 'borrowed_at', 'due_date', 'returned_at', 'status', 'notes'];

    protected function casts(): array
    {
        return [
            'borrowed_at' => 'date',
            'due_date' => 'date',
            'returned_at' => 'date',
        ];
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(LibraryBook::class, 'book_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function fines(): HasMany
    {
        return $this->hasMany(LibraryFine::class, 'borrowing_id');
    }

    public function isOverdue(): bool
    {
        return $this->status === 'borrowed' && $this->due_date->isPast();
    }

    public function markReturned(): void
    {
        $this->update([
            'returned_at' => now()->toDateString(),
            'status' => 'returned',
        ]);

        $this->book->returnBook();
    }

    public function markLost(): void
    {
        $this->update(['status' => 'lost']);
        $this->book->decrement('total_copies');
        $this->book->decrement('available_copies');
    }

    public function calculateFine(): float
    {
        if (!$this->isOverdue()) {
            return 0;
        }

        $daysOverdue = now()->diffInDays($this->due_date);
        $dailyFine = config('library.daily_fine', 1.00);

        return $daysOverdue * $dailyFine;
    }
}