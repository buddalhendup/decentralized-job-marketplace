import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { connectWallet, getContractWithSigner } from '../services/contract';

/**
 * Display a single job and optionally allow a user to accept or complete it.
 *
 * @param {Object} props
 * @param {Object} props.job The job struct from the contract
 * @param {number} props.id The job ID
 */
export default function JobCard({ job, id, refresh }) {
  const [loading, setLoading] = useState(false);

  const accept = async () => {
    setLoading(true);
    try {
      const signer = await connectWallet();
      const contract = getContractWithSigner(signer);
      const tx = await contract.acceptJob(id);
      await tx.wait();
      alert('Job accepted!');
      if (refresh) refresh();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to accept job');
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    setLoading(true);
    try {
      const signer = await connectWallet();
      const contract = getContractWithSigner(signer);
      const tx = await contract.submitWork(id);
      await tx.wait();
      alert('Work submitted!');
      if (refresh) refresh();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to submit work');
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    setLoading(true);
    try {
      const signer = await connectWallet();
      const contract = getContractWithSigner(signer);
      const tx = await contract.confirmCompletion(id);
      await tx.wait();
      alert('Payment released!');
      if (refresh) refresh();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to confirm completion');
    } finally {
      setLoading(false);
    }
  };

  const autoRelease = async () => {
    setLoading(true);
    try {
      const signer = await connectWallet();
      const contract = getContractWithSigner(signer);
      const tx = await contract.autoRelease(id);
      await tx.wait();
      alert('Funds auto released!');
      if (refresh) refresh();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to auto release');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ marginBottom: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {job.title}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          Client: {job.client}
        </Typography>
        <Typography variant="body2">{job.description}</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Price: {job.price.toString()}
        </Typography>
        <Typography variant="body2">
          Deadline: {new Date(Number(job.deadline) * 1000).toLocaleString()}
        </Typography>
        <Typography variant="body2">
          Worker: {job.worker === '0x0000000000000000000000000000000000000000' ? '—' : job.worker}
        </Typography>
        <Typography variant="body2">
          Status: {job.confirmed ? 'Completed' : job.completed ? 'Submitted' : job.accepted ? 'In progress' : 'Open'}
        </Typography>
      </CardContent>
      <CardActions>
        {!job.accepted && (
          <Button size="small" variant="contained" disabled={loading} onClick={accept}>
            Accept
          </Button>
        )}
        {job.accepted && !job.completed && (
          <Button size="small" variant="contained" disabled={loading} onClick={submit}>
            Submit Work
          </Button>
        )}
        {job.completed && !job.confirmed && (
          <Button size="small" variant="contained" disabled={loading} onClick={confirm}>
            Confirm Completion
          </Button>
        )}
        {!job.confirmed && job.accepted && Number(job.deadline) * 1000 < Date.now() && (
          <Button size="small" variant="outlined" disabled={loading} onClick={autoRelease}>
            Auto Release
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
