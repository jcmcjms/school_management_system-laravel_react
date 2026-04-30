<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

abstract class Controller
{
    use AuthorizesRequests, ValidatesRequests;

    protected string $resourceClass = '';
    protected string $collectionClass = '';
    protected string $modelName = 'Item';

    public function index(Request $request): Response|JsonResponse
    {
        $model = $this->getModel();
        $query = $model::query();

        $this->applyFilters($query, $request);
        $this->applySorting($query, $request);

        $perPage = $request->integer('per_page', 15);
        $perPage = min($perPage, 100);

        $resources = $query->paginate($perPage);

        if ($request->expectsJson()) {
            return $this->paginatedResponse($resources);
        }

        return Inertia::render($this->getIndexView(), $this->transformForInertia($resources));
    }

    public function show(int $id): Response|JsonResponse
    {
        $model = $this->getModel();
        $resource = $model::with($this->getIncludes())->findOrFail($id);

        if (request()->expectsJson()) {
            return $this->resourceResponse($resource);
        }

        return Inertia::render($this->getShowView(), [
            $this->getResourceKey() => $this->transformResource($resource),
        ]);
    }

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $this->validateForStore($request);

        $model = $this->getModel();
        $resource = $model::create($validated);

        $this->afterStore($resource, $validated);

        return $this->respondCreated($resource);
    }

    public function update(Request $request, int $id): RedirectResponse|JsonResponse
    {
        $model = $this->getModel();
        $resource = $model::findOrFail($id);

        $validated = $this->validateForUpdate($request, $resource);

        $resource->update($validated);

        $this->afterUpdate($resource, $validated);

        return $this->respondUpdated($resource);
    }

    public function destroy(int $id): RedirectResponse|JsonResponse
    {
        $model = $this->getModel();
        $resource = $model::findOrFail($id);

        $this->beforeDelete($resource);

        $resource->delete();

        return $this->respondDeleted($resource);
    }

    protected function getModel(): string
    {
        return $this->modelClass ?? '';
    }

    protected function getIndexView(): string
    {
        return $this->indexView ?? '';
    }

    protected function getShowView(): string
    {
        return $this->showView ?? '';
    }

    protected function getResourceKey(): string
    {
        return $this->resourceKey ?? strtolower($this->modelName);
    }

    protected function getIncludes(): array
    {
        return $this->includes ?? [];
    }

    protected function applyFilters($query, Request $request): void
    {
        if (method_exists($this, 'applyCustomFilters')) {
            $this->applyCustomFilters($query, $request);
        }
    }

    protected function applySorting($query, Request $request): void
    {
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
    }

    protected function validateForStore(Request $request): array
    {
        if (method_exists($this, 'storeValidation')) {
            return $request->validate($this->storeValidation());
        }
        return $request->validate($this->getStoreRules());
    }

    protected function validateForUpdate(Request $request, $resource): array
    {
        if (method_exists($this, 'updateValidation')) {
            return $request->validate($this->updateValidation($resource));
        }
        return $request->validate($this->getUpdateRules($resource));
    }

    protected function getStoreRules(): array
    {
        return [];
    }

    protected function getUpdateRules($resource): array
    {
        return [];
    }

    protected function afterStore($resource, array $validated): void
    {
    }

    protected function afterUpdate($resource, array $validated): void
    {
    }

    protected function beforeDelete($resource): void
    {
    }

    protected function transformForInertia($resources): array
    {
        if ($this->collectionClass && class_exists($this->collectionClass)) {
            $collectionClass = $this->collectionClass;
            return [
                $this->getResourceKey() => $collectionClass::collection($resources),
            ];
        }

        return [
            $this->getResourceKey() => $resources,
        ];
    }

    protected function transformResource($resource)
    {
        if ($this->resourceClass && class_exists($this->resourceClass)) {
            $resourceClass = $this->resourceClass;
            return new $resourceClass($resource);
        }

        return $resource;
    }

    protected function paginatedResponse($resources): JsonResponse
    {
        if ($this->collectionClass && class_exists($this->collectionClass)) {
            $collectionClass = $this->collectionClass;
            return response()->json([
                'data' => $collectionClass::collection($resources),
                'meta' => [
                    'current_page' => $resources->currentPage(),
                    'last_page' => $resources->lastPage(),
                    'per_page' => $resources->perPage(),
                    'total' => $resources->total(),
                ],
            ]);
        }

        return response()->json($resources);
    }

    protected function resourceResponse($resource): JsonResponse
    {
        return response()->json([
            'data' => $this->transformResource($resource),
        ]);
    }

    protected function respondCreated($resource): RedirectResponse|JsonResponse
    {
        $message = "{$this->modelName} created successfully";

        if (request()->expectsJson()) {
            return response()->json([
                'message' => $message,
                'data' => $this->transformResource($resource),
            ], 201);
        }

        return redirect()->back()->with('success', $message);
    }

    protected function respondUpdated($resource): RedirectResponse|JsonResponse
    {
        $message = "{$this->modelName} updated successfully";

        if (request()->expectsJson()) {
            return response()->json([
                'message' => $message,
                'data' => $this->transformResource($resource),
            ]);
        }

        return redirect()->back()->with('success', $message);
    }

    protected function respondDeleted($resource): RedirectResponse|JsonResponse
    {
        $message = "{$this->modelName} deleted successfully";

        if (request()->expectsJson()) {
            return response()->json([
                'message' => $message,
            ]);
        }

        return redirect()->back()->with('success', $message);
    }

    protected function respondError(string $message, int $code = 422): JsonResponse
    {
        return response()->json([
            'message' => $message,
        ], $code);
    }

    protected function logError(\Throwable $e): void
    {
        Log::error(get_class($e) . ': ' . $e->getMessage(), [
            'exception' => $e,
            'user_id' => auth()->id(),
            'request' => request()->all(),
        ]);
    }
}
