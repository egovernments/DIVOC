package pkg

func isEqual(arr1 []string, arr2 []string) bool {
	// If one is nil, the other must also be nil.
	if (arr1 == nil) != (arr2 == nil) {
		return false
	}

	if len(arr1) != len(arr2) {
		return false
	}

	for _, e := range arr1 {
		if !contains(arr2, e) {
			return false
		}
	}
	return true
}

func contains(arr []string, str string) bool {
	for _, a := range arr {
		if a == str {
			return true
		}
	}
	return false
}

