use std::ops::Range;

pub fn in_range<T>(value: &T, range: Range<T>) -> bool
    where for<'a> &'a T: PartialOrd
{
    value >= &range.start && value <= &range.end
}
