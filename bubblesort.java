
//brute froce approach

// public class bubblesort{
//     public static void Print (int[] arr) {
//         for (int ele : arr){
//             System.out.print(ele+" ");
//         }
//         System.out.println();
//     }
//     public static void main(String[] args) {
//         int[] arr ={2,5,1,8,3,0,-9};
//         int n = arr.length;
//         Print(arr);
//         for(int i=0 ; i<n-1 ; i++){
//         for(int j=0;j<n-1-i;j++){
//             if(arr[j]>arr[j+1]){
//                int temp =arr[j];
//                arr[j] =arr[j+1];
//                arr[j+1] = temp;

//             }
//         }}
//           Print(arr);
//   }
// }



//optimized approach


// public class bubblesort{
//     public static void Print (int[] arr) {
//         for (int ele : arr){
//             System.out.print(ele+" ");
//         }
//         System.out.println();
//     }
//     public static void main(String[] args) {
//         int[] arr ={2,5,1,8,3,0,-9};
//         int n = arr.length;
//         Print(arr);
//         for(int i=0 ; i<n-1 ; i++){
//             int swaps =0;
//         for(int j=0;j<n-1-i;j++){
//             if(arr[j]>arr[j+1]){
//                int temp =arr[j];
//                arr[j] =arr[j+1];
//                arr[j+1] = temp;
//                 swaps++;
//             }
//         }
//     if(swaps==0){
//         break;
//     }
         
//   } 
//   Print(arr);
//     }
// }



// Reverse Bubble Sort

public class bubblesort{
    public static void Print (int[] arr) {
        for (int ele : arr){
            System.out.print(ele+" ");
        }
        System.out.println();
    }
    public static void main(String[] args) {
        int[] arr ={2,5,1,8,3,0,-9};
        int n = arr.length;
        Print(arr);
        for(int i=0; i<n-1 ; i++){
        for(int j=0;j<n-1;j++){
            if(arr[j]<arr[j+1]){
               int temp =arr[j];
               arr[j] =arr[j+1];
               arr[j+1] = temp;

            }
        }}
          Print(arr);
  }
}
