# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## Added

- `insertAddress` function that calls `EstimateShipping` mutation in order to get available delivery options.
- `selectDeliveryOption` function that sets the current selected delivery option.
- Use `useQueueStatus` from `OrderQueue`.

## [0.1.0] - 2019-09-23

### Added

- Initial implementation of `OrderShippingProvider` and `useOrderShipping`.
