using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Threading;
using System.Threading.Tasks;
using YK.Application.Interfaces;

namespace YK.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private IDbContextTransaction? _currentTransaction;
        private bool _disposed = false;

        public UnitOfWork(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
        {
            if (_currentTransaction != null)
            {
                return;
            }
            _currentTransaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        }

        public async Task CommitAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                await SaveChangesAsync(cancellationToken);
                if (_currentTransaction != null)
                {
                    await _currentTransaction.CommitAsync(cancellationToken);
                }
            }
            catch
            {
                await RollbackAsync(cancellationToken);
                throw;
            }
            finally
            {
                if (_currentTransaction != null)
                {
                    _currentTransaction.Dispose();
                    _currentTransaction = null;
                }
            }
        }

        public async Task RollbackAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                if (_currentTransaction != null)
                {
                    await _currentTransaction.RollbackAsync(cancellationToken);
                }
            }
            finally
            {
                if (_currentTransaction != null)
                {
                    _currentTransaction.Dispose();
                    _currentTransaction = null;
                }
            }
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _currentTransaction?.Dispose();
                    _context.Dispose();
                }
                _disposed = true;
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
