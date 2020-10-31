# Versions

**New feature development** and **stability improvement** are equally important to product. But adding new features will affect stability, dubbo uses the following version development pattern to achieve a good balance.

## Two versions evolving at the same time

* BugFix Version：low version，e.g. `2.4.x`. This is called the GA version, which can be applied in production. We are supposed only to fix bugs in this version, and increase the third version number when release.
* Feature Version：high version, e.g. `2.5.x`. We add new features to this version, so applications have opportunities try new features.

When features in `2.5.x` are proved stable enough, we will announce `2.5.x` as a beta release. 

When `2.5.x` proved stable after enough test on enough applications：

* `2.5.x`, the GA Version, only do BugFix, the main version to be used. We can try to promote applications to upgrade to GA at the desired time.
* `2.4.x`, no longer maintained. When bugs appear, applications have no choice but upgrade to the latest stable version- Sunset Clause
* We create a new branch `2.6.0` based on `2.5.x` for new features.

## Pros

* GA Version are promised stable:
    * only BugFix
    * GA Version got enough tests before promotion
* New features can respond quickly in Feature Version and allow applications to try that
* Significantly reduces development and maintenance costs 

## The responsibilities of users

Users should always keep in track with the GA Version, make sure all bugs were fixed.

There is a fake proposition: regular upgrades bring more risks. Here's the reasons:

* GA remains stable after a trial period.
* Bugs find on GA will be fixed immediately.
* Comparing with the on-need-upgrade (only upgrade when find a serious problem, and may span multiple versions), upgrade periodically can flat risk. Experienced a long cycle of large projects, students will have such an experience, the tripartite library version does not upgrade for a long time, the result of the problem had to upgrade to the new version (across multiple versions) a huge risk.
