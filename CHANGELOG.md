# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] - 2020-07-13
### Added
- `searchedAddress` field to the `OrderShipping` context.

## [0.4.1] - 2020-04-27
### Changed
- Update typings of context.

## [0.4.0] - 2020-04-27
### Added
- Function to update the currently selected address.
- Return new order form on callbacks.

## [0.3.1] - 2020-02-19
### Changed
- Use the separate `default export`s from `vtex.checkout-resources`.

## [0.3.0] - 2019-12-10
### Added
- `canEditData` field to the data provided by `order-shipping`.

## [0.2.1] - 2019-11-19
### Changed
- Way to enqueue tasks returning if it was successful

## [0.2.0] - 2019-10-10
## Added
- `insertAddress` function that calls `EstimateShipping` mutation in order to get available delivery options.
- `selectDeliveryOption` function that sets the current selected delivery option.
- Use `useQueueStatus` from `OrderQueue`.
- `enqueueTask` function that calls `enqueue` from `OrderQueue`.

## [0.1.0] - 2019-09-23
### Added
- Initial implementation of `OrderShippingProvider` and `useOrderShipping`.
