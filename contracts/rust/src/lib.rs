use anchor_lang::prelude::*;

// Declare the program ID (this is a placeholder)
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod simple_storage {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        let storage_account = &mut ctx.accounts.storage_account;
        storage_account.data = data;
        msg!("Initialized with value: {}", data);
        Ok(())
    }

    pub fn update(ctx: Context<Update>, data: u64) -> Result<()> {
        let storage_account = &mut ctx.accounts.storage_account;
        storage_account.data = data;
        msg!("Updated value to: {}", data);
        Ok(())
    }

    pub fn increment(ctx: Context<Update>) -> Result<()> {
        let storage_account = &mut ctx.accounts.storage_account;
        storage_account.data += 1;
        msg!("Incremented value to: {}", storage_account.data);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8)]
    pub storage_account: Account<'info, StorageAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub storage_account: Account<'info, StorageAccount>,
}

#[account]
pub struct StorageAccount {
    pub data: u64,
}
