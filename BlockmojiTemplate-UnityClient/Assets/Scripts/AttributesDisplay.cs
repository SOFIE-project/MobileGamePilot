﻿/*
Copyright 2020 SOFIE. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using UnityEngine;
using UnityEngine.UI;

public class AttributesDisplay : MonoBehaviour
{
	[SerializeField] private GameObject _entryPrefab;
	[SerializeField] private bool _isTotalAttributes = false;
	public static AttributesDisplay TotalAttributes { get; private set; }

	private void Awake()
	{
		if (_isTotalAttributes) TotalAttributes = this;
		Clear();
	}

	private void Clear()
	{
		foreach (Transform child in transform)
		{
			GameObject.Destroy(child.gameObject);
		}
	}

	public void UpdateView(IReadOnlyDictionary<string, int> attributes)
	{
		Clear();
		foreach (string attName in attributes.Keys)
		{
			AddEntry(attName + ": " + attributes[attName]);
		}
	}

	private void AddEntry(string text)
	{
		GameObject entry = Instantiate(_entryPrefab, transform);
		entry.GetComponent<Text>().text = text;
	}
}