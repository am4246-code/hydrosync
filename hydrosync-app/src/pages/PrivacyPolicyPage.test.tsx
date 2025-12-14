import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrivacyPolicyPage from './PrivacyPolicyPage';

describe('PrivacyPolicyPage', () => {
  test('renders Privacy Policy heading', () => {
    render(<PrivacyPolicyPage />);
    expect(screen.getByRole('heading', { level: 1, name: /Privacy Policy/i })).toBeInTheDocument();
  });

  test('renders key sections of the policy', () => {
    render(<PrivacyPolicyPage />);
    expect(screen.getByRole('heading', { level: 2, name: /Interpretation and Definitions/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Collecting and Using Your Personal Data/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Use of Your Personal Data/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Security of Your Personal Data/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Contact Us/i })).toBeInTheDocument();
  });

  test('renders specific content within the policy', () => {
    render(<PrivacyPolicyPage />);
    expect(screen.getByText(/This Privacy Policy describes Our policies and procedures/i)).toBeInTheDocument();
    expect(screen.getByText(/We use Cookies and similar tracking technologies/i)).toBeInTheDocument();
    expect(screen.getByText(/The Company will retain Your Personal Data only for as long as is necessary/i)).toBeInTheDocument();
  });
});
