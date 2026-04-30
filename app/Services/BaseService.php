<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

abstract class BaseService
{
    protected string $modelClass = '';

    protected function getModel(): string
    {
        return $this->modelClass;
    }

    public function find(int $id, array $with = []): ?Model
    {
        $query = $this->getModel()::query();

        if (!empty($with)) {
            $query->with($with);
        }

        return $query->find($id);
    }

    public function findOrFail(int $id, array $with = []): Model
    {
        $query = $this->getModel()::query();

        if (!empty($with)) {
            $query->with($with);
        }

        return $query->findOrFail($id);
    }

    public function all(array $with = []): Collection
    {
        $query = $this->getModel()::query();

        if (!empty($with)) {
            $query->with($with);
        }

        return $query->get();
    }

    public function paginate(int $perPage = 15, array $with = []): LengthAwarePaginator
    {
        $query = $this->getModel()::query();

        if (!empty($with)) {
            $query->with($with);
        }

        return $query->paginate($perPage);
    }

    public function create(array $data): Model
    {
        $model = new $this->modelClass();
        $model->fill($data);
        $model->save();

        return $model;
    }

    public function update(Model $model, array $data): Model
    {
        $model->fill($data);
        $model->save();

        return $model;
    }

    public function delete(Model $model): bool
    {
        return $model->delete();
    }

    public function firstOrCreate(array $search, array $data = []): Model
    {
        return $this->getModel()::firstOrCreate($search, $data);
    }

    public function updateOrCreate(array $search, array $data = []): Model
    {
        return $this->getModel()::updateOrCreate($search, $data);
    }

    protected function applyFilters($query, array $filters): void
    {
        foreach ($filters as $key => $value) {
            if ($value !== null && $value !== '') {
                $query->where($key, $value);
            }
        }
    }

    protected function applySorting($query, ?string $sortBy, ?string $sortDir = 'desc'): void
    {
        $sortBy = $sortBy ?? 'created_at';
        $sortDir = in_array(strtolower($sortDir), ['asc', 'desc']) ? $sortDir : 'desc';

        $query->orderBy($sortBy, $sortDir);
    }
}
