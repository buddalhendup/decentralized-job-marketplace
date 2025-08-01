import React, { useState } from 'react';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { ethers } from 'ethers';
import { connectWallet, getContractWithSigner } from '../services/contract';

// Predefined list of stablecoins on Polygon Mumbai (testnet) with decimals
const TOKENS = [
  { symbol: 'USDC', address: '0x9aa7fEc87CA69695Dd1f879567CcF49F3ba417E2', decimals: 6 },
  { symbol: 'USDT', address: '0x2e4A31Ff703212b8e1EcE5C5119fFaa9C89C6dBe', decimals: 6 },
];

export default function CreateJob() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deadline, setDeadline] = useState('');
  const [token, setToken] = useState(TOKENS[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !price || !deadline) {
      alert('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const signer = await connectWallet();
      const contract = getContractWithSigner(signer);
      const amount = ethers.parseUnits(price, token.decimals);
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);
      // The user must approve token spending via their wallet prior to posting the job
      const tx = await contract.postJob(title, description, amount, deadlineTimestamp, token.address);
      await tx.wait();
      alert('Job posted successfully!');
      // Reset fields
      setTitle('');
      setDescription('');
      setPrice('');
      setDeadline('');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 4 }} maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Post a Job
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          variant="outlined"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label="Description"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          label="Price"
          variant="outlined"
          fullWidth
          margin="normal"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          helperText={`Amount of ${token.symbol} (decimals ${token.decimals})`}
        />
        <TextField
          label="Deadline"
          variant="outlined"
          fullWidth
          margin="normal"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          select
          label="Token"
          variant="outlined"
          fullWidth
          margin="normal"
          value={token.symbol}
          onChange={(e) => {
            const selected = TOKENS.find((t) => t.symbol === e.target.value);
            setToken(selected);
          }}
        >
          {TOKENS.map((t) => (
            <MenuItem key={t.symbol} value={t.symbol}>
              {t.symbol}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" color="primary" type="submit" disabled={loading} sx={{ mt: 2 }}>
          {loading ? 'Posting…' : 'Post Job'}
        </Button>
      </form>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Before posting a job, make sure you have approved this dapp to spend your {token.symbol} in MetaMask or your
        wallet.  This can typically be done automatically when posting, but you may need to confirm a separate
        transaction.
      </Typography>
    </Container>
  );
}
